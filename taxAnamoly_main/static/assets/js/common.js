function ajaxRequest(data, successCallback) {
    $.ajax({
        url: DEF_AJAX_URL,
        data: data,
        type: "POST",
        success: function(data) {
            if (DEBUG_APP) {
                console.log('Success');
                console.log("Data: ", data);
            }
            let parseData = [];
            if (IS_CONTENT_TYPE_JSON) {
                parseData = data;
            } else {
                if (typeof data === 'string' && !data.isJsonParsable()) {
                    $('.loader-overlay').hide();
                    toastr.error("Fatal Error.");
                    console.log("Fatal Error has occurred");
                    return false;
                }
                parseData = JSON.parse(data);
            }

            if ((parseData.login == '0') && (data.ajax_request != 'LOGIN')) {
                toastr.error("You are Logged out !");
                setInterval(() => {
                    window.parent.location.href = HOST_URL + "login";
                }, 1000);
                return false;
            }
            if (typeof successCallback === 'function') {

                successCallback(parseData);
            }
        },
        error: function(xhr, status, error) {
            // console.log("AJAX Error");
            // console.log(xhr);
            // console.log(status);
            // console.log(error);
            $('.loader-overlay').hide();
            $('.overlay').hide();
            if (xhr.readyState == 0) {
                toastr.error("Opps! Could not connect to the server. Please try again.");
            } else if (xhr.readyState == 500) {
                toastr.error("Opps! Forbidden.");
            } else if (xhr.readyState == 404) {
                toastr.error("Not found Error.");
            }
            if (typeof errorCallback === 'function') {
                errorCallback(xhr, status, error);
            }
        }
    });
}

Array.prototype.removeItem = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while (((ax = this.indexOf(what)) !== -1) || ((ax = this.indexOf(what.toString())) !== -1)) {
            this.splice(ax, 1);
        }
    }
    return this;
};

String.prototype.isJsonParsable = function() {
    var a = this.valueOf();
    if (typeof a === 'undefined' || typeof a !== 'string') {
        return false;
    }
    if ((a.startsWith('[') && a.endsWith(']')) ||
        (a.startsWith('{') && a.endsWith('}'))) {
        try {
            JSON.parse(a);
            return true;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
};

const numberFormat = (number, precisionlength, moneyFormat = false) => {
    if (typeof number != 'number') {
        throw new Error('The number argument type is invalid.\nNumber expected passed ' + typeof number);
    }
    if (typeof precisionlength === undefined) {
        precisionlength = 0;
    }
    var nStr = number + '';
    //if(nStr.split('.').length > 1) { For adding zeros after precision point
    nStr = number.toFixed(precisionlength);
    nStr = nStr + '';
    //}
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    //Regex for comma
    if (moneyFormat) {
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
    }
    var result = x1 + x2;
    return result;
}

// Date Time format
const DT_FORMAT = {
    FULL_DATE_TIME_SIMPLE: 'd/m/Y H:i:s',
    FULL_DATE_SIMPLE: 'd/m/Y',
    FULL_TIME_SIMPLE: 'H:i:s',
    H_I_TIME_SAMPLE: 'H:i',
    FULL_DATE_TIME_UND: 'd_m_Y_H_i_s',
    FULL_TIME_12H: 'h:i:s',
    TIME_12H: 'h:i',
    DATE_UND: 'd_m_Y',
    TIME_UND: 'H_i_s',
    DB_FORMAT_DATE: 'Y-m-d',
    DB_FORMAT_TIME: 'H:i:s',
    DB_FORMAT_TIME_ZERO_SEC: 'H:i:0',
    DB_FORMAT_DATE_TIME: 'Y-m-d H:i:s',
    DB_FORMAT_DATE_TIME_ZERO_SEC: 'Y-m-d H:i:0'
};

const PATH_INFO_EXTENSION = 0;
const PATH_INFO_FILENAME = 1;
const PATH_INFO_PATH = 2;

const getFormattedDate = (format, optDate) => {
    let date = new Date();
    if (typeof optDate === 'object' && optDate instanceof Date) {
        date = optDate;
    }
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    let h = date.getHours();
    let i = date.getMinutes();
    let s = date.getSeconds();
    let medium = "";
    m = m < 10 ? "0" + m : m;
    d = d < 10 ? "0" + d : d;

    //Check if the format is for 12 hours
    if (format === DT_FORMAT.FULL_TIME_12H || format === DT_FORMAT.TIME_12H) {
        if (h > 12) {
            h -= 12;
            medium = "PM";
        } else {
            medium = "AM";
        }
        if (h == 0) {
            h = 12;
            medium = "AM";
        }
        if (h == 12 && (i > 0 || s > 0)) {
            medium = "PM";
        }
    }
    h = h < 10 ? "0" + h : h;
    i = i < 10 ? "0" + i : i;
    s = s < 10 ? "0" + s : s;
    switch (format) {
        case DT_FORMAT.FULL_DATE_TIME_SIMPLE:
            return `${d}/${m}/${y} ${h}/${i}/${s}`;
        case DT_FORMAT.FULL_DATE_SIMPLE:
            return `${d}/${m}/${y}`;
        case DT_FORMAT.FULL_TIME_SIMPLE:
        case DT_FORMAT.DB_FORMAT_TIME:
            return `${h}:${i}:${s}`;
        case DT_FORMAT.H_I_TIME_SAMPLE:
            return `${h}:${i}`;
        case DT_FORMAT.DB_FORMAT_TIME_ZERO_SEC:
            return `${h}:${i}:00`;
        case DT_FORMAT.FULL_DATE_TIME_UND:
            return `${d}_${m}_${y}_${h}_${i}_${s}`;
        case DT_FORMAT.DATE_UND:
            return `${d}_${m}_${y}`;
        case DT_FORMAT.TIME_UND:
            return `${h}_${i}_${s}`;
        case DT_FORMAT.DB_FORMAT_DATE:
            return `${y}-${m}-${d}`;
        case DT_FORMAT.DB_FORMAT_DATE_TIME:
            return `${y}-${m}-${d} ${h}:${i}:${s}`;
        case DT_FORMAT.DB_FORMAT_DATE_TIME_ZERO_SEC:
            return `${y}-${m}-${d} ${h}:${i}:00`;
        case DT_FORMAT.FULL_TIME_12H:
            return `${h}:${i}:${s} ${medium}`;
        case DT_FORMAT.TIME_12H:
            return `${h}:${i}${medium}`;
        default:
            return `${d}/${m}/${y} ${h}:${i}:${s}`;
    }

};

const checkDates = (date1, date2) => {
    let d1 = new Date(Date.parse(date1));
    let d2 = new Date(Date.parse(date2));

    let deq = d1.getTime() - d2.getTime();
    if (deq === 0) {
        return 0;
    } else if (deq < 0) {
        return -1;
    } else {
        return 1;
    }
};

const date_diff = (start_date, end_date) => {
    if (typeof start_date !== 'object' || typeof end_date !== 'object') {
        throw new Error("Date Object expected.");
    }

    let millis = (end_date.getTime() - start_date.getTime());
    let seconds = parseInt(millis / 1000);

    let minutes = parseInt(seconds / 60);
    let h = parseInt(minutes / 60);
    let days = parseInt(h / 24);
    seconds = seconds >= 0 ? seconds : 0;
    minutes = minutes >= 0 ? minutes : 0;
    h = h >= 0 ? h : 0;
    days = days >= 0 ? days : 0;
    let diff = {
        d: days,
        h,
        m: minutes,
        s: seconds,
        mili: millis
    };
    return diff;
}

function acceptNumber(evt, acceptDecimal = false) {
    let key = evt.which || evt.keyCode;
    let char = evt.key;
    // For checking in case > enterred when period
    if (char == '>') {
        return false;
    }
    if (char == 'Delete') {
        return false;
    }
    // For shift and ctrl and alt
    if (key == 16 || key == 17 || key == 18) {
        return false;
    }
    // In case the . enterred twice
    if (acceptDecimal && (key == 190 || key == 110)) {
        let v = evt.target.value;
        if (v.includes('.') || v != Math.floor(v)) {
            return false;
        }
    }
    if (key == 8 || key == 13 || (acceptDecimal && (key == 190 || key == 110))) {
        return true;
    }
    if (key >= 95 && key <= 105) {
        key -= 48;
    }
    let value = String.fromCharCode(key);
    return (!isNaN(parseFloat(value)));
}

function searchAKATable(value, table_id) {
    const $table = $(`#${table_id}`);
    const $trs = $table.find('tbody').children('tr');
    if (isInvalidValue(value)) {
        // Show all
        $trs.show();
        return;
    }
    if ($(`#${table_id}_ndf`).length > 0) {
        $(`#${table_id}_ndf`).remove();
    }
    let regex = new RegExp(value + "+", "i");
    let gfound = false;
    let td_count = $($trs[0]).children('td').length;
    $trs.each(function() {
        let $tr = $(this);
        let $tds = $tr.children('td');
        let found = false;
        $tds.each(function() {
            let td = $(this);
            let t = td.text();
            if (t.match(regex)) {
                found = true;
                gfound = true;
                return false;
            }
        });
        if (found) {
            $tr.show();
        } else {
            $tr.hide();
        }
    });
    if (!gfound) {
        if ($(`#${table_id}_ndf`).length == 0) {
            $table.append(`<tr id="${table_id}_ndf"><td colspan="${td_count}" style="color:crimson; text-align:center;">No record found.</td></tr>`)
        }
    }

}

$.fn.showLoader = function() {
    $l = $(this);
    $l.css({ 'display': 'flex' });
};

const pathinfo = (file_path, info) => {
    let fileinfo = file_path.split('/');
    let filenamewithextension = '';
    let ext = [];
    switch (info) {
        case PATH_INFO_EXTENSION:
            filenamewithextension = fileinfo.pop();
            ext = filenamewithextension.split('.');
            return ext.pop();
        case PATH_INFO_FILENAME:
            filenamewithextension = fileinfo.pop();
            ext = filenamewithextension.split('.');
            ext.pop();
            return ext.join('.');
        case PATH_INFO_PATH:
            fileinfo.pop();
            return fileinfo.join('/');
    }
};
const array_column = (arrayheystack, col) => {
    return arrayheystack.map(x => {
        if (typeof x == 'string' && x.isJsonParsable()) {
            x = JSON.parse(x);
        }
        return x[col];
    });
};

Date.prototype.inc_dec_date = function(numstr) {
    const date = new Date(this.valueOf());
    if (typeof numstr === 'undefined' || numstr == '' || numstr.length === 0) return date;
    operator = numstr.trim();
    operator = operator.substring(0, 1);
    numstr = numstr.replace(operator, "");
    num = parseInt(numstr.replace(/\D+$/g, ""));
    if (isNaN(num)) {
        return date;
    }
    str = numstr.replace(/[0-9]/g, '');
    str = str.trim();
    switch (str.toLowerCase()) {
        case 'days':
        case 'day':
        case 'd':
            if (operator == '+') {
                date.setDate(date.getDate() + num);
            } else if (operator == "-") {
                date.setDate(date.getDate() - num);
            }
            break;
        case 'months':
        case 'month':
        case 'm':
            if (operator == '+') {
                date.setMonth(date.getMonth() + num);
            } else if (operator == "-") {
                date.setMonth(date.getMonth() - num);
            }
            break;
        case "years":
        case "year":
        case 'y':
            if (operator == '+') {
                date.setFullYear(date.getFullYear() + num);
            } else if (operator == "-") {
                date.setFullYear(date.getFullYear() - num);
            }
            break;
        case "hours":
        case "hour":
        case 'h':
            if (operator == '+') {
                date.setHours(date.getHours() + num);
            } else if (operator == "-") {
                date.setHours(date.getHours() - num);
            }
            break;
        case "minutes":
        case "mintue":
        case "min":
        case 'i':
            if (operator == '+') {
                date.setMinutes(date.getMinutes() + num);
            } else if (operator == "-") {
                date.setMinutes(date.getMinutes() - num);
            }
            break;
        case "seconds":
        case "second":
        case "sec":
        case 's':
            if (operator == '+') {
                date.setSeconds(date.getSeconds() + num);
            } else if (operator == "-") {
                date.setSeconds(date.getSeconds() - num);
            }
            break;

    }

    return date;
};

//function for show formatted toastr alert [made by Jyotirmoy Saha]

function toastAlert($msg = "Success", $color = "success", $title = "") {
    toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": true,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "show",
            "hideMethod": "fadeOut"
        }
        // toastr[$color]($msg);
        // Swal.fire({
        //     title: $title,
        //     text: $msg,
        //     icon: $color,
        //     confirmButtonText: 'Okay'
        // });
    swal({
        title: $title,
        text: $msg,
        type: $color,
        confirmButtonClass: 'btn-sm btn-primary mt-3',
        confirmButtonText: 'Okay'
    });
};

/**
 * 
 * Log The passed data.
 * Require the DEBUG_APP to be true.
 * @param  {...any} data The data comma separeted to log.
 */
const clog = (...data) => {
    try {
        dba = DEBUG_APP;
    } catch (e) {
        console.error("Require DEBUG_APP");
        return false;
    }
    if (DEBUG_APP) console.log(...data);
}

/**
 * Set the value in the cookie with the name as the key
 * The expiryInDays define for how many days the cookie will be available in the browser
 * 
 * @param {string} name 
 * @param {any} value 
 * @param {number} expiryInDays 
 */
const setCookie = (name, value, expiryInDays) => {
    var d = new Date();
    d.setTime(d.getTime() + (expiryInDays * 24 * 60 * 60 * 1000));
    let expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name.trim()}=${value.trim()};${expires};path=/`;
};

/**
 * Get the value of the cookie name
 * Do not use spaces at the beginning and ending
 * @param {string} name 
 */
const getCookie = name => {
    let cookies = decodeURIComponent(document.cookie);
    let cookieArr = cookies.split(";");
    let parts = '';
    let splitPart = '';
    for (let i = 0; i < cookieArr.length; i++) {
        parts = cookieArr[i];
        splitPart = parts.split("=");
        if (splitPart[0].trim() == name.trim()) {
            return splitPart[1];
        }
    }
    return undefined;
};
const removeCookie = name => {
    document.cookie = `${name.trim()}= ;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const customLoader = (id) => {
    var l = `
        <div class="overlay" id="${id}">
            <div id="text"><div class="lds-dual-ring" style="margin-right: 20px;"></div>Please Wait...</div>
        </div>
    `;
    return l;
};
const getSpinner = ($applyOverlay = true, $id = '') => {
    // var l = `
    //     <div class="overlay" id="${id}">
    //         <div id="text"><div class="lds-dual-ring" style="margin-right: 20px;"></div>Please Wait...</div>
    //     </div>
    // `;
    // return l;

    $html = `<div class="spinner-border" role="status" id="${($applyOverlay ? "" : $id)}" style="${($applyOverlay ? "" : 'display:none;')}">
  <span class="sr-only">Loading...</span>
</div>`;
    if ($applyOverlay) {
        $html = `<div class="loader-overlay" id="${$id}" style="display: none;">${$html}</div>`;
    }
    return $html;
};

String.prototype.ucwords = function() {
    str = this.toLowerCase();
    return str.replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/g,
        function(s) {
            return s.toUpperCase();
        });
};
/**
 * 
 * @param {object} el 
 * @returns Checks if an element is empty or not
 */
function isEmpty(el) {
    return !$.trim(el.html())
}

// function acceptNumber(evt, acceptDecimal = false) {
//     let key = evt.which || evt.keyCode;
//     let char = evt.key;
//     // For checking in case > enterred when period
//     if (char == '>') {
//         return false;
//     }
//     // if (char == 'Delete') {
//     //     return false;
//     // }
//     // For shift and ctrl and alt
//     if (key == 16 || key == 18) {
//         return false;
//     }
//     // In case the . enterred twice
//     if (acceptDecimal && (key == 190 || key == 110)) {
//         let v = evt.target.value;
//         if (v.includes('.') || v != Math.floor(v)) {
//             return false;
//         }
//     }
//     $ctrl_prs = key == 17;
//     if (key == 8 || key == 13 || (acceptDecimal && (key == 190 || key == 110)) || key == 9 || key == 39 || key == 37 || key == 17 || key == 67 || key == 46) {
//         return true;
//     }
//     if (key >= 95 && key <= 105) {
//         key -= 48;
//     }
//     let value = String.fromCharCode(key);
//     return (!isNaN(parseFloat(value)));
// }

const getAsterics = () => {
    var
        $html = '<span class="form_label text-danger" style="padding: 5px;">*</span>';
    return $html;
};

const getToday = () => {
    // Get today's date
    var currentDate = new Date();

    // Calculate the new date
    var newDate = new Date(currentDate);

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    return formattedDate;
};
/** 
 * Prints only the div, not the whole document
 * @param {String} divId
 */
// function printDiv(divId) {
//     $(".no-print").hide();
//     $(".parentTableDiv").removeClass("table-responsive");
//     var content = $('#' + divId).html();
//     var printWindow = window.open('', '', 'height=600,width=800');
//     $(".no-print").show();
//     $(".parentTableDiv").addClass("table-responsive");

//     // Gather inline CSS from the main document
//     var inlineStyles = $('style').map(function() {
//         return $(this).html();
//     }).get().join('\n');

//     // Gather CSS from external stylesheets
//     var externalStyles = '';
//     $('link[rel="stylesheet"]').each(function() {
//         $.ajax({
//             url: $(this).attr('href'),
//             async: false,
//             success: function(data) {
//                 externalStyles += '<style>' + data + '</style>';
//             }
//         });
//     });

//     // Construct the print window document
//     printWindow.document.open();
//     printWindow.document.write('<html><head><title>Print</title>');
    
//     // Add external styles
//     printWindow.document.write(externalStyles);
    
//     // Add inline styles
//     if (inlineStyles) {
//         printWindow.document.write('<style>' + inlineStyles + '</style>');
//     }
    
//     printWindow.document.write('</head><body>');
//     printWindow.document.write(content);
//     printWindow.document.write('</body></html>');
//     printWindow.document.close();

//     // Print the document
//     printWindow.print();
// }
// function printDiv(divName) {
//     const
//         allPrintDiv=document.getElementById("allPrintDiv");
//     var 
//         printContents = document.getElementById(divName).innerHTML,
//         originalContents = document.body.innerHTML,
//         sidebarContent = document.getElementById("sidebar").innerHTML;

//     // document.body.innerHTML = printContents;
//     allPrintDiv.innerHTML = printContents;
//     $(".no-print").hide();
//     $(".parentTableDiv").removeClass("table-responsive");
//     window.print();

//     // document.body.innerHTML = originalContents;
//     // document.getElementById("sidebar").innerHTML = sidebarContent;
//     // location.reload();
// }

/** 
 * Prints only the div, not the whole document
 * @param {String} divName
 */
// function printDiv(divName) {
//     const divToPrint = document.getElementById(divName);

//     // Gather inline CSS from the main document
//     const inlineStyles = Array.from(document.querySelectorAll('style')).map(style => style.innerHTML).join('\n');

//     // Create a new window
//     const newWin = window.open('', 'Print-Window');

//     newWin.document.open();
//     newWin.document.write('<html><head><title>Print</title>');

//     // Add inline styles
//     if (inlineStyles) {
//         newWin.document.write('<style>' + inlineStyles + '</style>');
//     }

//     // Include the main document's external CSS (if any)
//     Array.from(document.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
//         newWin.document.write('<link rel="stylesheet" href="' + link.href + '">');
//     });

//     newWin.document.write('</head><body onload="window.print()">');
//     newWin.document.write(divToPrint.innerHTML);
//     newWin.document.write('</body></html>');
//     newWin.document.close();

//     // After the document is loaded, manipulate the new window's DOM
//     newWin.onload = function() {
//         // Hide elements with the class "no-print"
//         const noPrintElements = newWin.document.querySelectorAll('.no-print');
//         noPrintElements.forEach(el => el.style.display = 'none');

//         // Remove class "table-responsive" from elements with the class "parentTableDiv"
//         const parentTableDivs = newWin.document.querySelectorAll('.parentTableDiv');
//         parentTableDivs.forEach(el => el.classList.remove('table-responsive'));

//         // Print the content
//         newWin.focus();  // Focus on the new window
//         newWin.print();  // Open the print dialog

//         // Optionally close the new window after a brief delay
//         setTimeout(function() {
//             newWin.close();
//         }, 20);
//     };
// }


// function printDiv(divName) {
//     const divToPrint = document.getElementById(divName);

//     // Gather inline CSS from the main document
//     const inlineStyles = Array.from(document.querySelectorAll('style')).map(style => style.innerHTML).join('\n');

//     // Gather external CSS links
//     const externalStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href);

//     // Gather external scripts
//     const externalScripts = Array.from(document.querySelectorAll('script[src]')).map(script => script.src);

//     // Create the content for the new window
//     let htmlContent = `
//         <html>
//         <head>
//             <title>Print</title>
//             <style>${inlineStyles}</style>
//             ${externalStyles.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')}
//         </head>
//         <body>
//             ${divToPrint.innerHTML}
//             <script>
//                 // Hide elements with the class "no-print"
//                 document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');

//                 // Remove class "table-responsive" from elements with the class "parentTableDiv"
//                 document.querySelectorAll('.parentTableDiv').forEach(el => el.classList.remove('table-responsive'));

//                 // Load external scripts
//                 ${externalScripts.map(src => `
//                     (function() {
//                         var script = document.createElement('script');
//                         script.src = "${src}";
//                         script.onload = function() { console.log('Script loaded: ${src}'); };
//                         script.onerror = function(error) { console.error('Error loading script: ${src}', error); };
//                         document.body.appendChild(script);
//                     })();
//                 `).join('\n')}

//                 // Print the content
//                 window.onload = function() {
//                     window.print();
//                     setTimeout(function() {
//                         window.close();
//                     }, 500); // Adjust delay if necessary
//                 };
//             </script>
//         </body>
//         </html>
//     `;

//     // Open the new window with the HTML content
//     const newWin = window.open('', 'Print-Window');
//     newWin.document.open();
//     newWin.document.write(htmlContent);
//     newWin.document.close();
// }

function printDiv(divName) {
    const divToPrint = document.getElementById(divName);

    // Prepare the content for the new page
    const printContent = `
        <html>
        <head>
            <title>Print</title>
        </head>
        <body>
            ${divToPrint.innerHTML}
            <script>
                // Function to manipulate the DOM
                function manipulateDOM() {
                    // Hide elements with the class "no-print"
                    document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');

                    // Remove class "table-responsive" from elements with the class "parentTableDiv"
                    document.querySelectorAll('.parentTableDiv').forEach(el => el.classList.remove('table-responsive'));

                    // Print the content when the page loads
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500); // Adjust delay if necessary
                    };
                }

                // Run the DOM manipulation function
                manipulateDOM();
            </script>
        </body>
        </html>
    `;

    // Create a form to post the content
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = HOST_URL+'printcontent'; // Change this URL to your target page
    form.target = '_blank';

    // Add the content as a hidden input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'content';
    input.value = encodeURIComponent(printContent);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}




/**
 * Function to find elements in list [ul]
 * @param {String} input_field_id 
 * @param {String} list_ul_id 
 * @returns {string} Returns the searched item
 */
function JoysEye(input_field_id, list_ul_id) {
    //Declare variables
    var input, filter, ul, listElements, i, txtValue;
    input = document.getElementById(input_field_id);
    filter = input.value.toUpperCase();
    ul = document.getElementById(list_ul_id);
    listElements = ul.getElementsByTagName("li");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < listElements.length; i++) {
        txtValue = listElements[i].textContent || listElements[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            listElements[i].style.display = "";
        } else {
            listElements[i].style.display = "none";
        }
    }
}