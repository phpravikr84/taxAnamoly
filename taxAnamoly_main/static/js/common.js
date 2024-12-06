//Get OriginalUploadFilename
function extractFileName(filePath) {
    // Extract the file name from the file path using regular expression
    const regex = /(?:media\/csv\/)([\d\.]+.*\.csv)/;
    const match = filePath.match(regex);
    return match ? match[1] : null;
}

// Automatically hide flash messages after 5 seconds
document.addEventListener("DOMContentLoaded", function () {
    let alerts = document.querySelectorAll('.flash-screen');
    
    // Add fade-in effect on load
    alerts.forEach(function (alert) {
        alert.classList.add('fade-in');
    });

    // Wait 5 seconds, then add fade-out effect
    setTimeout(function () {
        alerts.forEach(function (alert) {
            alert.classList.remove('fade-in');
            alert.classList.add('fade-out');
        });
    }, 5000);

    // Optional: Remove the alert from the DOM after fade-out
    setTimeout(function () {
        alerts.forEach(function (alert) {
            alert.remove();
        });
    }, 7000); // 2 seconds after fade-out starts
});

// ============================================
// Upload Form jquery
// ============================================
$(document).ready(function () {
    //Hide Merge button on page load
    $('#mergeFiles').hide();
    $('#upload-button').click(function (e) {
        e.preventDefault();

        // Get form data
        let form = $('#upload-form')[0];
        let formData = new FormData(form);

        // Validate inputs
        let financialFilename = formData.get('financialfilename');
        let files = formData.getAll('file');
        
        if (!financialFilename) {
            Swal.fire('Error', 'Please select a Financial Filename.', 'error');
            return;
        }
        if (files.length === 0 || !files[0].name) {
            Swal.fire('Error', 'Please select at least one file to upload.', 'error');
            return;
        }

        // Use the form's action attribute to dynamically set the URL
        let uploadUrl = $(form).attr('action');

        $.ajax({
            url: uploadUrl, // Fixed to dynamically fetch the action URL
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val() // Ensure CSRF token is passed
            },
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire('Success', 'Files uploaded successfully!', 'success');
                    $('#mergeFiles').show();
                    
                    // Append uploaded files to the list
                    response.uploaded_files.forEach(file => {
                        //Rename file name
                        // Get the file name using the extractFileName function
                        let fileName = extractFileName(file.file_path);
                        $('#file-list').append(`
                            <li class="list-group-item" data-file-id="${file.id}">
                                ${fileName} <button class="btn btn-sm btn-danger delete-file"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
</svg></button>
                            </li>
                        `);
                    });
                } else {
                    Swal.fire('Error', response.message || 'File upload failed.', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'An unexpected error occurred during file upload.', 'error');
            }
        });
    });

    // Handle file deletion in Upload time
    $(document).on('click', '.delete-file', function () {
        let fileId = $(this).closest('.list-group-item').data('file-id');
        $.ajax({
            url: deleteFileUrl,
            type: 'POST',
            data: {
                file_id: fileId,
                csrfmiddlewaretoken: '{{ csrf_token }}',
            },
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire('Deleted', response.message, 'success');
                    $(`.list-group-item[data-file-id="${fileId}"]`).remove();
    
                    // Check if there are any list items left
                    if ($('#file-list').children().length === 0) {
                        $('#mergeFiles').hide(); // Hide the #mergeFiles button if no items are left
                    }
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'An unexpected error occurred.', 'error');
            }
        });
    });       
});



$(document).ready(function () {
    $('#merge-btn').click(function (e) {
        e.preventDefault(); // Prevent form submission

        // Show progress bar
        $('#progress-container').show();
        $('#progress-bar').css('width', '0%').attr('aria-valuenow', 0).text('0%');

        // Simulate progress bar increase
        let interval = setInterval(() => {
            let currentWidth = parseInt($('#progress-bar').attr('aria-valuenow'));
            if (currentWidth < 90) {
                currentWidth += 5;
                $('#progress-bar').css('width', currentWidth + '%').attr('aria-valuenow', currentWidth).text(currentWidth + '%');
            } else {
                clearInterval(interval);
            }
        }, 300);

        // Trigger AJAX request
        $.ajax({
            url: $(this).closest('form').attr('action'), // Get the form action dynamically
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val() // CSRF token
            },
            success: function (response) {
                // Complete progress bar and stop interval
                clearInterval(interval);
                $('#progress-bar').css('width', '100%').attr('aria-valuenow', 100).text('100%');

                // Show success alert
                Swal.fire({
                    title: 'Merge Complete!',
                    text: 'Your files have been successfully merged.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = redirectUrl;
                    }
                });
            },
            error: function () {
                // Handle errors
                clearInterval(interval);
                Swal.fire('Error', 'An error occurred while merging the files.', 'error');
            }
        });
    });

    // Delete Merge Files
    // Handle file deletion in Upload time
    $(document).on('click', '.del-merge-btn', function () {
        let fileId = $(this).data('file-id'); // Get file ID from the data attribute
        let deleteFileUrl = deleteMergeUrl; // Django URL for deletion
        
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: deleteFileUrl,
                    type: 'POST',
                    data: {
                        file_id: fileId,
                        csrfmiddlewaretoken: '{{ csrf_token }}',
                    },
                    success: function (response) {
                        if (response.status === 'success') {
                            Swal.fire('Deleted', response.message, 'success').then(() => {
                                window.location.href = response.redirect_url; // Redirect upon success
                            });
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function () {
                        Swal.fire('Error', 'An unexpected error occurred.', 'error');
                    }
                });
            }
        });
    });

});