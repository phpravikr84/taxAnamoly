$(document).ready(function() {
    // console.clear();
    //function for sticky navbar start
    if ($(window).width() > 992) {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 40) {
                $('#navbar_top').addClass("fixed-top");
                // add padding top to show content behind navbar
                $('body').css('padding-top', $('.navbar').outerHeight() + 'px');
            } else {
                $('#navbar_top').removeClass("fixed-top");
                // remove padding top from body
                $('body').css('padding-top', '0');
            }
        });
    }
    //function for sticky navbar End

    //function for Datepicker Start
    // $.fn.datepicker.defaults.format = "dd/mm/yyyy";
    // $('.datepicker').datepicker({});
    //function for Datepicker End
    $(".card").addClass("shadow");
});

//function updateTime() {
//    const now = new Date();
//
//    // Define options for the time format
//    const options = {
//        timeZone: TIME_ZONE,
//        hour: '2-digit',
//        minute: '2-digit',
//        second: '2-digit',
//        hour12: true, // Use 12-hour time format with AM/PM
//    };
//
//    // Format the time using Intl.DateTimeFormat
//    const formatter = new Intl.DateTimeFormat('en-US', options);
//    const timeString = formatter.format(now);
//
//    // Update the content of the div with the formatted time
//    if (document.getElementById('live-time')) {
//        document.getElementById('live-time').textContent = timeString;
//    }
//}

// Update the time immediately and then every second
//updateTime();
//setInterval(updateTime, 1000);

function LoginValidation() {
    const usid = $('#login_usid');
    const user_id = $('#login_user_id');
    const password = $('#login_pass');
    var usid_val = usid.val();
    var user_id_val = user_id.val();
    var pass_val = password.val();
    if (isInvalidValue(usid_val)) {
        pointInvalid(usid);
        toastAlert('Please Enter Your USID', 'error');
        return false;
    } else {
        usid.removeClass('error_input');
    }
    if (isNaN(usid_val)) {
        pointInvalid(usid);
        toastAlert('Please Enter A Valid USID', 'error');
        return false;
    } else {
        usid.removeClass('error_input');
    }
    if (isInvalidValue(user_id_val)) {
        pointInvalid(user_id);
        toastAlert('Please Enter Your User Id', 'error');
        return false;
    } else {
        user_id.removeClass('error_input');
    }
    if (isInvalidValue(pass_val)) {
        pointInvalid(password);
        toastAlert('Please Enter Your Password', 'error');
        return false;
    } else {
        password.removeClass('error_input');
    }

    const data = {
        ajax_action: 'ADMIN_LOGIN',
        usid_val,
        user_id_val,
        pass_val
    };
    ajaxRequest(data, function(response) {
        let res_msg = response.message;
        let res_error = response.error;
        if (res_error) {
            toastAlert(res_msg, 'error');
            return false;
        } else {
            toastAlert(res_msg, 'success');
            // console.log(response);
            // return;
            // window.location.reload();
            setInterval(() => {
                window.location.href = HOST_URL;
            }, 1000);
            return false;
        }
    });
}

function eventListner(event) {
    var keycode = event.which;
    if (keycode == 13) {
        $('#login_submit').click();
    }
}

const checkIfLoggedIn = (during = "N/A") => {
    ajaxRequest({ ajax_action: "ChkIflogged", during: during }, res => {
        if (res.kkout) {
            toastAlert(res.message, "warning");
            setInterval(() => {
                window.location.href = HOST_URL;
                return false;
            }, 1000);
        }
    });
};

// function for reset the account password
$("#reset_pass").on('click', () => {
    const $old_pass = $("#old_pass"),
        $new_pass = $("#reset_pass"),
        $cnew_pass = $("#cnew_pass"),
        $err = $("#err"),
        $err_sp = $err.find(".err_sp");

    var old_pass = $old_pass.val(),
        new_pass = $new_pass.val(),
        cnew_pass = $cnew_pass.val();
    $err_sp.val("");
    $err.hide();
    checkIfLoggedIn();
    if (isInvalidValue(old_pass)) {
        pointInvalid($old_pass);
        $err_sp.text("Please Enter the Old Password");
        $err.show();
        return false;
    }
    ajaxRequest({ ajax_action: "getOldPass", op: old_pass }, res => {
        if (res.error) {
            pointInvalid($old_pass);
            $err_sp.text(res.message);
            $err.show();
            return false;
        }
    });

});
const frgt_pass = () => {
    alert("Please Contact Your Administrator !");
};

$("#user_sign_in").on('click', () => {
    const $user_id = $('#user_id'),
        $user_pass = $("#user_pass"),
        $err_sp = $("#err_sp"),
        $signin_progress = $("#signin_progress"),
        $progress_bar = $signin_progress.find(".progress-bar");
    var user_id = $user_id.val(),
        user_pass = $user_pass.val(),
        signin_progress_val = Math.floor(Math.random() * (78 - 10 + 1)) + 10;

    $err_sp.text("");
    $err_sp.hide();

    if (isInvalidValue(user_id)) {
        pointInvalid($user_id);
        $err_sp.text("Please Enter your Registered Email / Mobile Number");
        $err_sp.show();
        return false;
    } else {
        checkRtype();
        $user_id.removeClass("error_input");
        $err_sp.text("");
        $err_sp.hide();
    }
    if (isInvalidValue(user_pass)) {
        pointInvalid($user_pass);
        $err_sp.text("Please Enter your Password");
        $err_sp.show();
        return false;
    } else {
        $user_pass.removeClass("error_input");
        $err_sp.text("");
        $err_sp.hide();
    }
    const data = {
        ajax_action: "LOGIN",
        em: user_id,
        ep: user_pass,
        rt: login_rtype
    };
    $signin_progress.show();
    for (let i = 1; i <= signin_progress_val; i++) {
        $progress_bar.css("width", i + "%");
        $progress_bar.text("" + i + "%");
    }
    ajaxRequest(data, (res) => {
        err = res.error;
        msg = res.message;
        // return false;
        if (err) {
            $signin_progress.hide();
            $progress_bar.css("width", "1%");
            $progress_bar.text("1%");
            $err_sp.text(msg);
            $err_sp.show();
            return false;
        } else {
            // $signin_progress.show();
            for (let i = signin_progress_val; i <= 100; i++) {
                $progress_bar.css("width", i + "%");
                $progress_bar.text("" + i + "%");
                clog(i);
                if (i == 100) {
                    toastAlert(msg, "success");
                    $progress_bar.css("width", "100%");
                    $progress_bar.text("100%");
                    setTimeout(() => {
                        window.location.href = HOST_URL;
                        return false;
                    }, 1000);
                    return false;
                }
            }
        }
    });
});

$('#user_id').on('keypress', () => {
    checkRtype();
});

const checkRtype = (act = "") => {
    const $user_id = $('input[name="user_id"]');
    let user_id = extractValue($user_id);
    rtype = isNaN(removeCountryCode(user_id)) ? 'e' : 'p';
    clog(rtype);
    const $err_sp = $("#err_sp");
    // const error_msg_p = error_div.find('p');
    switch (act) {
        case "fpass":
            const button = $('#sub_button');
            var error = '';
            if (!isEmail(user_id) && !isPhone(user_id)) {
                error = "Please enter a valid email or phone number.";
            }
            var isemail = (error == "") ? true : false;
            clog(isemail);
            if (!isemail) {
                error_msg_p.html(error);
                error_div.show();
                button.prop('disabled', true);
                button.prop('readonly', true);
                button.css('cursor', 'not-allowed');
            } else {
                error_msg_p.html(error);
                error_div.hide();
                button.prop('disabled', false);
                button.prop('readonly', false);
                button.css('cursor', 'pointer');
            }
            break;

        default:
            // let label = th.prev('label');
            // (rtype == 'p') ? login_rtype = 'm': login_rtype = 'Email';
            login_rtype = rtype;
            break;
    }
};
const removeCountryCode = (number) => {
    // return (number.replace(/^(?:\+?27|\+?91|0)?/, '')).trim();
    var value = number;
    // Remove all spaces
    var mobile = value.replace(/ /g, '');

    // If string starts with +, drop first 3 characters
    if (value.slice(0, 1) == '+') {
        mobile = mobile.substring(3)
    }

    // If string starts with 0, drop first 4 characters
    if (value.slice(0, 1) == '0') {
        mobile = mobile.substring(4)
    }

    // clog(mobile);
    return mobile;
};
const togglePassword = (th) => {
    const pass_input = th.closest('.input-group').find('input'),
        type = pass_input.attr('type') === 'password' ? 'text' : 'password',
        iele = (type === 'text') ? `<i class="fa fa-eye-slash" aria-hidden="true"></i>` : `<i class="fa fa-eye" aria-hidden="true"></i>`;
    pass_input.attr('type', type);
    // toggle the eye / eye slash icon
    // th.find('i').addClass('fa fa-eye-slash');
    th.html(iele);
};

// $("#designation_active").on("click", () => {
//     var desig_active = $("#designation_active");
//     if (desig_active.checked) {
//         toastAlert("Activated", "success");
//     } else {
//         toastAlert("Deactivated", "error");
//     }
// });

// const desig_active = document.getElementById('designation_active');

// desig_active.addEventListener('change', e => {
//     if (e.target.checked === true) {
//         // console.log("Checkbox is checked - boolean value: ", e.target.checked);
//         toastAlert("Activated :" + e.target.checked, "success");
//     }
//     if (e.target.checked === false) {
//         // console.log("Checkbox is not checked - boolean value: ", e.target.checked);
//         toastAlert("Deactivated : " + e.target.checked, "error");
//     }
// });
$("#ChangeUserPassword").on("click",()=>{
    const
        $user_old_pass = $("#user_old_pass"),
        $user_pass = $("#user_pass"),
        $user_cpass = $("#user_cpass"),
        $err_sp = $("#err_sp"),
        loader = $("#SettingLoader");
    var
        user_old_pass = $user_old_pass.val(),
        user_pass = $user_pass.val(),
        user_cpass = $user_cpass.val();
    $user_old_pass.removeClass("error_input");
    $user_pass.removeClass("error_input");
    $user_cpass.removeClass("error_input");
    $err_sp.hide();
    $err_sp.html("");
    if (isInvalidValue(user_old_pass,true)) {
        toastAlert("Please enter your old password", "error");
        $err_sp.html("Please enter your old password");
        $err_sp.show();
        pointInvalid($user_old_pass);
        return false;
    }
    if (isInvalidValue(user_pass,true)) {
        toastAlert("Please enter a new password", "error");
        $err_sp.html("Please enter a new password");
        $err_sp.show();
        pointInvalid($user_pass);
        return false;
    } else {
        if ((user_pass.length < 8) || (user_pass.length > 20)) {
            toastAlert("Password Must be 8-20 characters long", "error");
            $err_sp.html("Password Must be 8-20 characters long");
            $err_sp.show();
            pointInvalid($user_pass);
            return false;
        }
    }
    if (isInvalidValue(user_cpass,true)) {
        toastAlert("Please confirm the new password", "error");
        $err_sp.html("Please confirm the new password");
        $err_sp.show();
        pointInvalid($user_cpass);
        return false;
    } else {
        if ((user_cpass.length < 8) || (user_cpass.length > 20)) {
            toastAlert("Password Must be 8-20 characters long", "error");
            $err_sp.html("Password Must be 8-20 characters long");
            $err_sp.show();
            pointInvalid($user_cpass);
            return false;
        }
    }
    if (user_old_pass===user_pass) {
        toastAlert("Old password & New Password cannot be same", "error");
        $err_sp.html("Old password & New Password cannot be same");
        $err_sp.show();
        pointInvalid($user_pass);
        return false;
    }
    if (user_pass!==user_cpass) {
        toastAlert("Passwords are not matching", "error");
        $err_sp.html("Passwords are not matching");
        $err_sp.show();
        pointInvalid($user_cpass);
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"CHANGE_USER_PASSWORD",
        op:user_old_pass,
        np:user_pass,
        cp:user_cpass
    },(res)=>{
        let
            err = res.error,
            msg = res.message;
        loader.hide();
        $err_sp.html("");
        $err_sp.hide();
        if (err) {
            toastAlert(msg,"error");
            $err_sp.html(msg);
            $err_sp.show();
            return false;
        }
        toastAlert(msg);
        setTimeout(() => {
            location.reload();
        }, 1000);
        return false;
    });
});
$("#designation_submit").on('click', () => {
    const $desig_name = $("#desig_name"),
        $desig_responcibilities = $("#desig_responcibilities"),
        $desig_exp = $("#desig_exp"),
        $designation_active = document.getElementById('designation_active'),
        loader = $("#desig_loader");
    var desig_name = $desig_name.val(),
        desig_exp = $desig_exp.val(),
        desig_responcibilities = $desig_responcibilities.val(),
        designation_active = true;
    $designation_active.addEventListener('change', e => {
        if (e.target.checked === true) {
            // console.log("Checkbox is checked - boolean value: ", e.target.checked);
            designation_active = e.target.checked;
            toastAlert("Set to Active :" + e.target.checked, "success");
        }
        if (e.target.checked === false) {
            // console.log("Checkbox is not checked - boolean value: ", e.target.checked);
            designation_active = e.target.checked;
            toastAlert("Set to Deactive : " + e.target.checked, "error");
        }
    });

    $desig_name.removeClass('error_input');
    $desig_responcibilities.removeClass('error_input');
    $desig_exp.removeClass('error_input');

    if (isInvalidValue(desig_name)) {
        pointInvalid($desig_name);
        toastAlert("Designation name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(desig_responcibilities)) {
        desig_responcibilities = "";
    }
    if (isInvalidValue(desig_exp)) {
        desig_exp = "";
    }
    if (designation_active) {
        designation_active = 1;
    } else {
        designation_active = 0;
    }
    loader.css({ display: 'flex' });
    const data = {
        ajax_action: "ADD_DESIGNATION",
        dname: desig_name,
        dres: desig_responcibilities,
        dact: designation_active,
        dexp: desig_exp
    };
    clog(data);
    // return false;
    ajaxRequest(data, (res) => {
        err = res.error;
        msg = res.message;
        alert_color = (err) ? "error" : "success";
        loader.hide();
        toastAlert(msg, alert_color);
        if (err) {
            return false;
        }
        $desig_name.val("");
        $desig_responcibilities.val("");
        $desig_exp.val("");
        let sti = setInterval(() => {
            clearInterval(sti);
            location.reload();
            return false;
        }, 1000);
        return false;
    });
});


const changeNavigateBtn = ($action) => {
    var list_row, add_row,
        btn = ``,
        txt = "",
        $btn = $("#list_nav_btn"),
        $btn_name = $("#list_nav_btn").children(".btn").attr("name");
    switch ($action) {
        case "designation":
            add_row = $("#add_designation_row");
            list_row = $("#view_designation_row");
            break;
        case "payslip":
            add_row = $("#upload_payslip_row");
            list_row = $("#view_payslip_row");
            break;
        case "company":
            add_row = $("#add_company_row");
            list_row = $("#view_company_row");
            break;
        case "notice":
            add_row = $("#add_notice_sec");
            list_row = $("#view_notice_sec");
            break;
        case "assign_audit":
            add_row = $("#assign_audit_add_row");
            list_row = $("#assign_audit_view_row");
            break;
    }
    // clog($btn_name);

    switch ($btn_name) {
        case "list":
            btn = `<button class="btn btn-sm btn-primary" name="add" onclick="changeNavigateBtn('${$action}');"><small><i class="fas fa-plus"></i>&nbsp;Add</small></button>`;
            txt = "Add";
            add_row.hide();
            list_row.show();
            switch ($action) {
                case "assign_audit":
                    getAuditAssignmentViewData();
                    $("#all_auditor_statics_table_row").hide();
                    break;
                case "notice":
                    getNoticeTable();
                    break;
            }
            break;
        case "add":
            btn = `<button class="btn btn-sm btn-primary" name="list" onclick="changeNavigateBtn('${$action}');"><small><i class="fas fa-list"></i>&nbsp;View List</small></button>`;
            txt = "View List";
            add_row.show();
            list_row.hide();
            switch ($action) {
                case "assign_audit":
                    $("#all_auditor_statics_table_row").css({ display: 'flex' });
                    break;
            }
            break;
    }
    $btn.find(".btn").remove();
    $btn.append(btn);
};
const changePositionNavigateBtn = () => {
    var
        list_row, add_row,
        btn = ``,
        txt = "",
        $btn = $("#position-list-nav"),
        $btn_name = $btn.children(".btn").attr("name"),
        add_row = $("#add-position-sec"),
        list_row = $("#view-position-sec");
    // clog($btn_name);

    switch ($btn_name) {
        case "list":
            btn = `<button class="btn btn-sm btn-primary" name="add" onclick="changePositionNavigateBtn();"><small><i class="fas fa-plus"></i>&nbsp;Issue</small></button>`;
            txt = "Add";
            add_row.hide();
            list_row.show();
            break;
        case "add":
            btn = `<button class="btn btn-sm btn-primary" name="list" onclick="changePositionNavigateBtn();"><small><i class="fas fa-list"></i>&nbsp;View List</small></button>`;
            txt = "View List";
            add_row.show();
            list_row.hide();
            break;
    }
    $btn.find(".btn").remove();
    $btn.append(btn);
};
const changeAssessmentNavigateBtn = () => {
    var
        list_row, add_row,
        btn = ``,
        txt = "",
        $btn = $("#assessment-list-nav"),
        $btn_name = $btn.children(".btn").attr("name"),
        add_row = $("#add-assessment-sec"),
        list_row = $("#view-assessment-sec");
    // clog($btn_name);

    switch ($btn_name) {
        case "list":
            btn = `<button class="btn btn-sm btn-primary" name="add" onclick="changeAssessmentNavigateBtn();"><small><i class="fas fa-plus"></i>&nbsp;Issue</small></button>`;
            txt = "Add";
            add_row.hide();
            list_row.show();
            break;
        case "add":
            btn = `<button class="btn btn-sm btn-primary" name="list" onclick="changeAssessmentNavigateBtn();"><small><i class="fas fa-list"></i>&nbsp;View List</small></button>`;
            txt = "View List";
            add_row.show();
            list_row.hide();
            break;
    }
    $btn.find(".btn").remove();
    $btn.append(btn);
};
const addMemoNav = () => {
    var
        list_row, add_row,
        btn = ``,
        txt = "",
        $btn = $(".memo_nav_btn"),
        $btn_name = $btn.children(".btn").attr("name"),
        add_row = $(".add_memo_col"),
        list_row = $(".view_memo_col");
    // clog($btn_name);

    switch ($btn_name) {
        case "list":
            btn = `
            <button type="button" class="btn btn-sm btn-primary" id="add_memo_btn" name="add" onclick="addMemoNav();">
                <small><i class="fas fa-plus"></i>&nbsp;Add Memo</small>
            </button>
            `;
            txt = "Add";
            add_row.hide();
            list_row.show();
            break;
        case "add":
            btn = `
            <button type="button" class="btn btn-sm btn-primary" id="add_memo_btn" name="list" onclick="addMemoNav();">
                <small><i class="fas fa-list"></i>&nbsp;View List</small>
            </button>
            `;
            txt = "View List";
            add_row.show();
            list_row.hide();
            break;
    }
    $btn.find(".btn").remove();
    $btn.append(btn);
};
const changeObjectionNavigateBtn = () => {
    var
        list_row, add_row,
        btn = ``,
        txt = "",
        $btn = $("#objection-list-nav"),
        $btn_name = $btn.children(".btn").attr("name"),
        add_row = $("#add-objection-sec"),
        list_row = $("#view-objection-sec");
    // clog($btn_name);

    switch ($btn_name) {
        case "list":
            btn = `<button class="btn btn-sm btn-primary" name="add" onclick="changeObjectionNavigateBtn();"><small><i class="fas fa-plus"></i>&nbsp;Issue</small></button>`;
            txt = "Add";
            add_row.hide();
            list_row.show();
            break;
        case "add":
            btn = `<button class="btn btn-sm btn-primary" name="list" onclick="changeObjectionNavigateBtn();"><small><i class="fas fa-list"></i>&nbsp;View List</small></button>`;
            txt = "View List";
            add_row.show();
            list_row.hide();
            break;
    }
    $btn.find(".btn").remove();
    $btn.append(btn);
};

$("#emp_add_btn").on("click", () => {
    const $emp_name = $("#emp_name"),
        $emp_date_of_birth = $("#emp_date_of_birth"),
        $emp_mother_name = $("#emp_mother_name"),
        $emp_father_name = $("#emp_father_name"),
        $emp_mobile = $("#emp_mobile"),
        $emp_email = $("#emp_email"),
        $blood_group = $("#blood_group"),
        $emp_payroll = $("#emp_payroll"),
        $emp_date_of_join = $("#emp_date_of_join"),
        $emp_desig_id = $("#emp_desig_id"),
        $emp_remarks = $("#emp_remarks"),
        $emp_exp = $("#emp_exp"),
        loader = $("#emp_loader");

    const $emp_id = $("#emp_id"),
        $emp_department = $("#emp_department"),
        $emp_salary = $("#emp_salary"),
        $emp_webmail = $("#emp_webmail"),
        $emergeny_contact_name = $("#emergeny_contact_name"),
        $emergeny_contact_mobile = $("#emergeny_contact_mobile"),
        $current_address = $("#current_address"),
        $permanent_address = $("#permanent_address"),
        $emp_aadhaar = $("#emp_aadhaar"),
        $emp_pan = $("#emp_pan"),
        $emp_salary_ac_number = $("#emp_salary_ac_number"),
        $emp_salary_ac_ifsc = $("#emp_salary_ac_ifsc"),
        $emp_uan = $("#emp_uan"),
        $emp_esic_ip_number = $("#emp_esic_ip_number"),
        $employee_user_type = $("#employee_user_type"), //select box
        $user_password = $("#user_password"),
        $employee_report_manager = $("#employee_report_manager"),
        $employee_report_time = $("#employee_report_time");


    var emp_name = $emp_name.val(),
        emp_date_of_birth = $emp_date_of_birth.val(),
        emp_mother_name = $emp_mother_name.val(),
        emp_father_name = $emp_father_name.val(),
        emp_mobile = $emp_mobile.val(),
        emp_email = $emp_email.val(),
        blood_group = $blood_group.val(),
        emp_payroll = $emp_payroll.children("option:selected").val(),
        emp_date_of_join = $emp_date_of_join.val(),
        emp_desig_id = $emp_desig_id.children("option:selected").val(),
        emp_remarks = $emp_remarks.val(),
        emp_exp = $emp_exp.val();

    var emp_id = $emp_id.val(),
        emp_department = $emp_department.children("option:selected").val(),
        emp_salary = $emp_salary.val(),
        emp_webmail = $emp_webmail.val(),
        emergeny_contact_name = $emergeny_contact_name.val(),
        emergeny_contact_mobile = $emergeny_contact_mobile.val(),
        current_address = $current_address.val(),
        permanent_address = $permanent_address.val(),
        emp_aadhaar = $emp_aadhaar.val(),
        emp_pan = $emp_pan.val(),
        emp_salary_ac_number = $emp_salary_ac_number.val(),
        emp_salary_ac_ifsc = $emp_salary_ac_ifsc.val(),
        emp_uan = $emp_uan.val(),
        emp_esic_ip_number = $emp_esic_ip_number.val(),
        user_password = $user_password.val(),
        employee_user_type = $employee_user_type.children("option:selected").val(),
        employee_report_manager = $employee_report_manager.children("option:selected").val(),
        employee_report_time = $employee_report_time.children("option:selected").val();

    $emp_mobile.removeClass("error_input");
    if (isInvalidValue(emp_name)) {
        pointInvalid($emp_name);
        toastAlert("Employee name cannot be left blank", "error");
        return false;
    } else {
        $emp_name.removeClass("error_input");
    }
    if (isInvalidValue(emp_id)) {
        pointInvalid($emp_id);
        toastAlert("Employee ID cannot be left blank", "error");
        return false;
    } else {
        $emp_id.removeClass("error_input");
    }

    // if (!(emp_desig_id)) {
    //     pointInvalid($emp_desig_id);
    //     toastAlert("Employee Designation cannot be left blank", "error");
    //     return false;
    // } else {
    //     $emp_desig_id.removeClass("error_input");
    // }
    // if (!(emp_department)) {
    //     pointInvalid($emp_department);
    //     toastAlert("Employee Department cannot be left blank", "error");
    //     return false;
    // } else {
    //     $emp_department.removeClass("error_input");
    // }
    if (isInvalidValue(emp_mobile)) {
        pointInvalid($emp_mobile);
        toastAlert("Mobile Number cannot be left blank", "error");
        return false;
    } else {
        if (isNaN(emp_mobile)) {
            pointInvalid($emp_mobile);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emp_mobile.removeClass("error_input");
        }
        if ((emp_mobile.length) > 13) {
            pointInvalid($emp_mobile);
            clog(emp_mobile.length);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emp_mobile.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_email)) {
        pointInvalid($emp_email);
        toastAlert("Email cannot be left blank", "error");
        return false;
    } else {
        $emp_email.removeClass("error_input");
    }
    if (isInvalidValue(emergeny_contact_mobile)) {

    } else {
        if (isNaN(emergeny_contact_mobile)) {
            pointInvalid($emergeny_contact_mobile);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emergeny_contact_mobile.removeClass("error_input");
        }
        if ((emergeny_contact_mobile.length) > 13) {
            pointInvalid($emergeny_contact_mobile);
            clog(emergeny_contact_mobile.length);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emergeny_contact_mobile.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_aadhaar)) {

    } else {
        if (isNaN(emp_aadhaar)) {
            pointInvalid($emp_aadhaar);
            toastAlert("Enter a valid Aadhaar number", "error");
            return false;
        } else {
            $emp_aadhaar.removeClass("error_input");
        }
        if ((emp_aadhaar.length) > 13) {
            pointInvalid($emp_aadhaar);
            clog(emp_aadhaar.length);
            toastAlert("Enter a valid Aadhaar number", "error");
            return false;
        } else {
            $emp_aadhaar.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_salary_ac_number)) {

    } else {
        if (isNaN(emp_salary_ac_number)) {
            pointInvalid($emp_salary_ac_number);
            toastAlert("Enter a valid Account number", "error");
            return false;
        } else {
            $emp_salary_ac_number.removeClass("error_input");
        }
        if ((emp_salary_ac_number.length) > 13) {
            pointInvalid($emp_salary_ac_number);
            clog(emp_salary_ac_number.length);
            toastAlert("Enter a valid Account number", "error");
            return false;
        } else {
            $emp_salary_ac_number.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_uan)) {

    } else {
        if (isNaN(emp_uan)) {
            pointInvalid($emp_uan);
            toastAlert("Enter a valid UAN number", "error");
            return false;
        } else {
            $emp_uan.removeClass("error_input");
        }
        if ((emp_uan.length) > 13) {
            pointInvalid($emp_uan);
            clog(emp_uan.length);
            toastAlert("Enter a valid UAN number", "error");
            return false;
        } else {
            $emp_uan.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_esic_ip_number)) {

    } else {
        if (isNaN(emp_esic_ip_number)) {
            pointInvalid($emp_esic_ip_number);
            toastAlert("Enter a valid IP number", "error");
            return false;
        } else {
            $emp_esic_ip_number.removeClass("error_input");
        }
        if ((emp_esic_ip_number.length) > 13) {
            pointInvalid($emp_esic_ip_number);
            clog(emp_esic_ip_number.length);
            toastAlert("Enter a valid IP number", "error");
            return false;
        } else {
            $emp_esic_ip_number.removeClass("error_input");
        }
    }
    if (!(employee_user_type)) {
        pointInvalid($employee_user_type);
        toastAlert("Employee User Type Must be Selected", "error");
        return false;
    } else {
        $employee_user_type.removeClass("error_input");
    }
    // if (!(employee_report_manager)) {
    //     pointInvalid($employee_report_manager);
    //     toastAlert("Employee Reporting Manager Must be Selected", "error");
    //     return false;
    // } else {
    //     $employee_report_manager.removeClass("error_input");
    // }
    // if (!(employee_report_time)) {
    //     pointInvalid($employee_report_time);
    //     toastAlert("Employee Reporting Time Must be Selected", "error");
    //     return false;
    // } else {
    //     $employee_report_time.removeClass("error_input");
    // }
    if (isInvalidValue(user_password)) {
        pointInvalid($user_password);
        toastAlert("Password cannot be left blank", "error");
        return false;
    } else {
        $user_password.removeClass("error_input");
    }
    loader.showLoader();
    const data = {
        ajax_action: "ADD_EMPLOYEE",
        enm: emp_name,
        edb: emp_date_of_birth,
        emn: emp_mother_name,
        efn: emp_father_name,
        emb: emp_mobile,
        eeml: emp_email,
        ebg: blood_group,
        eprl: emp_payroll,
        edtj: emp_date_of_join,
        ermk: emp_remarks,
        exp: emp_exp,
        edgn: emp_desig_id,
        emp_esic_ip_number,
        emp_uan,
        emp_salary_ac_ifsc,
        emp_salary_ac_number,
        emp_pan,
        emp_aadhaar,
        permanent_address,
        current_address,
        emergeny_contact_mobile,
        emergeny_contact_name,
        emp_webmail,
        emp_salary,
        emp_department,
        emp_id,
        utype: employee_user_type,
        upass: user_password,
        rpt_mngr: employee_report_manager,
        employee_report_time
    };
    // clog(data);
    
    // let empListLink='';
    // switch (CURRENT_USER_TYPE) {
    //     case SADMIN:
    //         empListLink='';
    //         break;
    
    //     default:
    //         break;
    // }
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, 'error');
            loader.hide();
            return false;
        }
        toastAlert(msg);
        setTimeout(() => {
            loader.hide();
            // window.location.href = HOST_URL + 'add-auditors';
            location.reload();
            return false;
        }, 1000);
    });
});

$("#department_submit").on('click', () => {
    const $department_name = $("#department_name"),
        loader = $("#department_loader");
    var department_name = $department_name.val();

    loader.showLoader();
    $department_name.removeClass("error_input");
    if (isInvalidValue(department_name)) {
        pointInvalid($department_name);
        toastAlert($department_name.attr('name') + " cannot be left blank", "error");
        loader.hide();
        return false;
    }
    loader.showLoader();
    const data = { ajax_action: "ADD_DEPARTMENT", dnm: department_name };
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message,
            color = "success";
        if (err) {
            color = "error";
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        toastAlert(msg, color);
        loader.hide();
        setTimeout(() => {
            location.reload();
            return false;
        }, 1000);
    });
});
const checkEmpInactiveReasons = () => {
    const
        $emp_inactive_other_reason_section = $("#emp_inactive_other_reason_section"),
        $emp_inactive_reason = $("#emp_inactive_reason"),
        $emp_inactive_other_reason = $("#emp_inactive_other_reason");
    var
        emp_inactive_reason = $emp_inactive_reason.children('option:selected').val();
    $emp_inactive_other_reason.val('');
    $emp_inactive_other_reason_section.hide();
    if (emp_inactive_reason == OTHER_REASON) {
        $emp_inactive_other_reason.val('');
        $emp_inactive_other_reason_section.show();
    }
};
const changeEmployeeActiveStatus = (id) => {
    const
        modal = $("#emp_inactive_status_update"),
        emp_inactive_other_reason_section = $("#emp_inactive_other_reason_section"),
        emp_inactive_reason = $("#emp_inactive_reason"),
        emp_inactive_other_reason = $("#emp_inactive_other_reason");
    emp_inactive_other_reason.val('');
    emp_inactive_reason.val(RESIGNED);
    emp_inactive_other_reason_section.hide();
    $("#emp_inactive_id").val(id);
    modal.modal('show');
};
$("#emp_modal_update_btn").on("click", () => {
    const
        modal = $("#emp_inactive_status_update"),
        $emp_inactive_id = $("#emp_inactive_id"),
        $emp_inactive_other_reason_section = $("#emp_inactive_other_reason_section"),
        $emp_inactive_reason = $("#emp_inactive_reason"),
        $emp_last_working_day = $("#emp_last_working_day"),
        $emp_inactive_other_reason = $("#emp_inactive_other_reason");

    var emp_id = $emp_inactive_id.val(),
        inactive_status = $emp_inactive_reason.children("option:selected").val(),
        emp_last_working_day = $emp_last_working_day.val(),
        emp_inactive_other_reason = $emp_inactive_other_reason.val();

    if (isInvalidValue(inactive_status, true)) {
        pointInvalid($emp_inactive_reason);
        toastAlert("Please Select a Reason Status", "error");
        return false;
    } else {
        $emp_inactive_reason.removeClass("error_input");
    }
    if (isInvalidValue(emp_last_working_day)) {
        pointInvalid($emp_last_working_day);
        toastAlert("Last Working Day cannot be left blank", "error");
        return false;
    }
    if (inactive_status == OTHER_REASON) {
        if (isInvalidValue(emp_inactive_other_reason)) {
            pointInvalid($emp_inactive_other_reason);
            toastAlert("Inactive reason cannot be left blank", "error");
            return false;
        } else {
            $emp_inactive_other_reason.removeClass("error_input");
        }
    } else {
        emp_inactive_other_reason = "";
    }
    const data = {
        ajax_action: "EMPLOYEE_ACTIVE",
        row_id: emp_id,
        act_status: inactive_status,
        lwd: emp_last_working_day,
        oth: emp_inactive_other_reason
    };
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            // loader.hide();
            return false;
        }
        toastAlert(msg);
        // loader.hide();
        modal.modal('hide');
        setInterval(() => {
            location.reload();
            return false;
        }, 1000);
    });
});

const changeActiveStatus = (action, id, page_loader) => {
    const active_input = document.getElementById('' + action + '_active_' + id + '');

    active_input.addEventListener('change', e => {
        var data = {
                row_id: id
            },
            active = 0,
            loader = $("#" + page_loader);
        loader.showLoader();
        if (e.target.checked === true) {
            // console.log("Checkbox is checked - boolean value: ", e.target.checked);
            // toastAlert("Activated :" + e.target.checked, "success");
            active = 1;
        }
        if (e.target.checked === false) {
            // console.log("Checkbox is not checked - boolean value: ", e.target.checked);
            // toastAlert("Deactivated : " + e.target.checked, "error");
            active = 0;
        }
        switch (action) {
            case "employee":
                data["ajax_action"] = "EMPLOYEE_ACTIVE";

                if (active == 0) {
                    changeEmployeeActiveStatus(id);
                    loader.hide();
                    return false;
                }
                break;
            case "notice":
                data['ajax_action'] = "NOTICE_ACTIVE";
                break;
            case "payslip":
                data['ajax_action'] = "PAYSLIP_ACTIVE";
                break;
        }
        data["act_status"] = active;
        // clog(data);
        ajaxRequest(data, (res) => {
            var err = res.error,
                msg = res.message;
            if (err) {
                toastAlert(msg, "error");
                loader.hide();
                return false;
            }
            toastAlert(msg);
            loader.hide();
            switch (action) {
                case "notice":
                    var $label_class = (active == 1) ? "text-success" : "text-warning",
                        $label_removeclass = (active == 1) ? "text-warning" : "text-success",
                        $label_text = (active == 1) ? "Published" : "Draft";
                    $('#notice_' + id + '').find(".custom-control-label").html($label_text);
                    $('#notice_' + id + '').find(".custom-control-label").removeClass($label_removeclass);
                    $('#notice_' + id + '').find(".custom-control-label").addClass($label_class);
                    break;
                case "payslip":
                    var $label_class = (active == 1) ? "text-success" : "text-danger",
                        $label_removeclass = (active == 1) ? "text-danger" : "text-success",
                        $label_text = (active == 1) ? "A" : "D";
                    $('#' + action + '_' + id + '').find(".custom-control-label").html($label_text);
                    $('#' + action + '_' + id + '').find(".custom-control-label").removeClass($label_removeclass);
                    $('#' + action + '_' + id + '').find(".custom-control-label").addClass($label_class);
                    break;
                case "employee":
                    setInterval(() => {
                        location.reload();
                        return false;
                    }, 1000);
                    break;
            }
        });
    });
}

const updateEmployee = (data) => {
    const $emp_name = $("#emp_name"),
        $emp_date_of_birth = $("#emp_date_of_birth"),
        $emp_mother_name = $("#emp_mother_name"),
        $emp_father_name = $("#emp_father_name"),
        $emp_mobile = $("#emp_mobile"),
        $emp_email = $("#emp_email"),
        $blood_group = $("#blood_group"),
        $emp_payroll = $("#emp_payroll"),
        $emp_date_of_join = $("#emp_date_of_join"),
        $emp_desig_id = $("#emp_desig_id"),
        $emp_remarks = $("#emp_remarks"),
        $emp_exp = $("#emp_exp"),
        loader = $("#employee_loader");

    const $emp_id = $("#emp_id"),
        $emp_department = $("#emp_department"),
        $emp_salary = $("#emp_salary"),
        $emp_webmail = $("#emp_webmail"),
        $emergeny_contact_name = $("#emergeny_contact_name"),
        $emergeny_contact_mobile = $("#emergeny_contact_mobile"),
        $current_address = $("#current_address"),
        $permanent_address = $("#permanent_address"),
        $emp_aadhaar = $("#emp_aadhaar"),
        $emp_pan = $("#emp_pan"),
        $emp_salary_ac_number = $("#emp_salary_ac_number"),
        $emp_salary_ac_ifsc = $("#emp_salary_ac_ifsc"),
        $emp_uan = $("#emp_uan"),
        $emp_esic_ip_number = $("#emp_esic_ip_number"),
        $list_employee_row = $("#list_employee_row"),
        $edit_employee_row = $("#edit_employee_row"),
        $employee_user_type = $("#employee_user_type"), //select box
        $user_password = $("#user_password"),
        $employee_report_time = $("#employee_report_time"), //select box
        $employee_report_manager = $("#employee_report_manager"); //select box

    loader.showLoader();
    $emp_name.val(data.employee_name);
    $emp_date_of_birth.val(data.employee_date_of_birth);
    $emp_mother_name.val(data.employee_mother_name);
    $emp_father_name.val(data.employee_father_name);
    $emp_mobile.val(data.employee_mobile);
    $emp_email.val(data.employee_email);
    $blood_group.val(data.employee_blood_group);
    $emp_payroll.val(data.employee_payroll).change();
    $emp_date_of_join.val(data.employee_date_of_joinning);
    $emp_desig_id.val(data.employee_designation_id).change();
    $emp_remarks.val(data.remarks);
    $emp_exp.val(data.employee_experience_duration);

    $emp_id.val(data.employee_id);
    $emp_department.val(data.department_id).change();
    $emp_salary.val(data.salary_amount);
    $emp_webmail.val(data.webmail_address);
    $emergeny_contact_name.val(data.emergency_contact_person_name);
    $emergeny_contact_mobile.val(data.emergency_contact_person_mobile_number);
    $current_address.val(data.current_address);
    $permanent_address.val(data.permanent_address);
    $emp_aadhaar.val(data.aadhaar_number);
    $emp_pan.val(data.pan_number);
    $emp_salary_ac_number.val(data.salary_account_number);
    $emp_salary_ac_ifsc.val(data.salary_account_ifsc_code);
    $emp_uan.val(data.uan_number);
    $emp_esic_ip_number.val(data.esic_ip_number);
    $employee_user_type.val(data.user_type).change();
    $employee_report_time.val(data.reporting_time).change();
    $employee_report_manager.val(data.reporting_manager_user_id).change();
    // $user_password.val(data.password);
    $user_password.val("XXXXXXXXXX");

    $employee_user_type.attr("disabled", "disabled");
    $employee_report_manager.attr("disabled", "disabled");
    $user_password.attr("disabled", "disabled");
    $employee_user_type.attr("readonly", "readonly");
    $employee_report_manager.attr("readonly", "readonly");
    $user_password.attr("readonly", "readonly");
    $(".empFormPasswordSec").hide();

    $("#emp_update_btn").attr("data-id", data.id);

    $("#last_update_display").find("#last_update_date_span").children("span").text(data.last_update_date);
    $("#emp_active_status").children("span").html((data.active == 1) ? "ACTIVE" : ((data.active == OTHER_REASON) ? EMPLOYEE_INACTIVE_REASONS[data.active] + "&nbsp;<span class='text-dark' style='font-weight:normal;'>[ " + data.inactive_reason + " ]</span>" : EMPLOYEE_INACTIVE_REASONS[data.active]));
    if (data.active != 1) {
        $("#last_update_display").children("div").show();
        $("#last_update_display").find("#last_working_day_span").children("span").text(data.last_working_day);
        $("#emp_active_status").children("span").removeClass("text-success");
        $("#emp_active_status").children("span").addClass("text-secondary");
    } else {
        $("#emp_active_status").children("span").removeClass("text-secondary");
        $("#emp_active_status").children("span").addClass("text-success");
        $("#last_update_display").children("div").hide();
    }
    var
        navBtn = `
        <button class="btn btn-sm btn-primary" name="list" onclick="window.location.href=window.location.href"><i class="fas fa-arrow-circle-left"></i>&nbsp;Back</button>
    `;
    $("#list_nav_btn").html(navBtn);
    $list_employee_row.hide();
    $edit_employee_row.show();
    loader.hide();
};

$("#emp_update_btn").on("click", () => {
    const $emp_name = $("#emp_name"),
        $emp_date_of_birth = $("#emp_date_of_birth"),
        $emp_mother_name = $("#emp_mother_name"),
        $emp_father_name = $("#emp_father_name"),
        $emp_mobile = $("#emp_mobile"),
        $emp_email = $("#emp_email"),
        $blood_group = $("#blood_group"),
        $emp_payroll = $("#emp_payroll"),
        $emp_date_of_join = $("#emp_date_of_join"),
        $emp_desig_id = $("#emp_desig_id"),
        $emp_remarks = $("#emp_remarks"),
        $emp_exp = $("#emp_exp"),
        loader = $("#employee_loader");

    const $emp_id = $("#emp_id"),
        $emp_department = $("#emp_department"),
        $emp_salary = $("#emp_salary"),
        $emp_webmail = $("#emp_webmail"),
        $emergeny_contact_name = $("#emergeny_contact_name"),
        $emergeny_contact_mobile = $("#emergeny_contact_mobile"),
        $current_address = $("#current_address"),
        $permanent_address = $("#permanent_address"),
        $emp_aadhaar = $("#emp_aadhaar"),
        $emp_pan = $("#emp_pan"),
        $emp_salary_ac_number = $("#emp_salary_ac_number"),
        $emp_salary_ac_ifsc = $("#emp_salary_ac_ifsc"),
        $emp_uan = $("#emp_uan"),
        $emp_esic_ip_number = $("#emp_esic_ip_number"),
        $employee_report_time = $("#employee_report_time");


    var emp_name = $emp_name.val(),
        emp_date_of_birth = $emp_date_of_birth.val(),
        emp_mother_name = $emp_mother_name.val(),
        emp_father_name = $emp_father_name.val(),
        emp_mobile = $emp_mobile.val(),
        emp_email = $emp_email.val(),
        blood_group = $blood_group.val(),
        emp_payroll = $emp_payroll.children("option:selected").val(),
        emp_date_of_join = $emp_date_of_join.val(),
        emp_desig_id = $emp_desig_id.children("option:selected").val(),
        emp_remarks = $emp_remarks.val(),
        emp_exp = $emp_exp.val();

    var emp_id = $emp_id.val(),
        emp_department = $emp_department.children("option:selected").val(),
        employee_report_time = $employee_report_time.children("option:selected").val(),
        emp_salary = $emp_salary.val(),
        emp_webmail = $emp_webmail.val(),
        emergeny_contact_name = $emergeny_contact_name.val(),
        emergeny_contact_mobile = $emergeny_contact_mobile.val(),
        current_address = $current_address.val(),
        permanent_address = $permanent_address.val(),
        emp_aadhaar = $emp_aadhaar.val(),
        emp_pan = $emp_pan.val(),
        emp_salary_ac_number = $emp_salary_ac_number.val(),
        emp_salary_ac_ifsc = $emp_salary_ac_ifsc.val(),
        emp_uan = $emp_uan.val(),
        emp_esic_ip_number = $emp_esic_ip_number.val();

    if (isInvalidValue(emp_name)) {
        pointInvalid($emp_name);
        toastAlert("Employee name cannot be left blank", "error");
        return false;
    } else {
        $emp_name.removeClass("error_input");
    }
    if (isInvalidValue(emp_id)) {
        pointInvalid($emp_id);
        toastAlert("Employee ID cannot be left blank", "error");
        return false;
    } else {
        $emp_id.removeClass("error_input");
    }
    if (!(emp_desig_id)) {
        pointInvalid($emp_desig_id);
        toastAlert("Employee Designation cannot be left blank", "error");
        return false;
    } else {
        $emp_desig_id.removeClass("error_input");
    }
    if (!(emp_department)) {
        pointInvalid($emp_department);
        toastAlert("Employee Department cannot be left blank", "error");
        return false;
    } else {
        $emp_department.removeClass("error_input");
    }
    if (!(employee_report_time)) {
        pointInvalid($employee_report_time);
        toastAlert("Employee Reporting Time cannot be left blank", "error");
        return false;
    } else {
        $employee_report_time.removeClass("error_input");
    }
    if (isInvalidValue(emp_mobile)) {

    } else {
        if (isNaN(emp_mobile)) {
            pointInvalid($emp_mobile);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emp_mobile.removeClass("error_input");
        }
        if ((emp_mobile.length) > 13) {
            pointInvalid($emp_mobile);
            clog(emp_mobile.length);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emp_mobile.removeClass("error_input");
        }
    }
    if (isInvalidValue(emergeny_contact_mobile)) {

    } else {
        if (isNaN(emergeny_contact_mobile)) {
            pointInvalid($emergeny_contact_mobile);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emergeny_contact_mobile.removeClass("error_input");
        }
        if ((emergeny_contact_mobile.length) > 13) {
            pointInvalid($emergeny_contact_mobile);
            clog(emergeny_contact_mobile.length);
            toastAlert("Enter a valid mobile number", "error");
            return false;
        } else {
            $emergeny_contact_mobile.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_aadhaar)) {

    } else {
        if (isNaN(emp_aadhaar)) {
            pointInvalid($emp_aadhaar);
            toastAlert("Enter a valid Aadhaar number", "error");
            return false;
        } else {
            $emp_aadhaar.removeClass("error_input");
        }
        if ((emp_aadhaar.length) > 13) {
            pointInvalid($emp_aadhaar);
            clog(emp_aadhaar.length);
            toastAlert("Enter a valid Aadhaar number", "error");
            return false;
        } else {
            $emp_aadhaar.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_salary_ac_number)) {

    } else {
        if (isNaN(emp_salary_ac_number)) {
            pointInvalid($emp_salary_ac_number);
            toastAlert("Enter a valid Account number", "error");
            return false;
        } else {
            $emp_salary_ac_number.removeClass("error_input");
        }
        if ((emp_salary_ac_number.length) > 13) {
            pointInvalid($emp_salary_ac_number);
            clog(emp_salary_ac_number.length);
            toastAlert("Enter a valid Account number", "error");
            return false;
        } else {
            $emp_salary_ac_number.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_uan)) {

    } else {
        if (isNaN(emp_uan)) {
            pointInvalid($emp_uan);
            toastAlert("Enter a valid UAN number", "error");
            return false;
        } else {
            $emp_uan.removeClass("error_input");
        }
        if ((emp_uan.length) > 13) {
            pointInvalid($emp_uan);
            clog(emp_uan.length);
            toastAlert("Enter a valid UAN number", "error");
            return false;
        } else {
            $emp_uan.removeClass("error_input");
        }
    }
    if (isInvalidValue(emp_esic_ip_number)) {

    } else {
        if (isNaN(emp_esic_ip_number)) {
            pointInvalid($emp_esic_ip_number);
            toastAlert("Enter a valid IP number", "error");
            return false;
        } else {
            $emp_esic_ip_number.removeClass("error_input");
        }
        if ((emp_esic_ip_number.length) > 13) {
            pointInvalid($emp_esic_ip_number);
            clog(emp_esic_ip_number.length);
            toastAlert("Enter a valid IP number", "error");
            return false;
        } else {
            $emp_esic_ip_number.removeClass("error_input");
        }
    }
    loader.showLoader();
    const data = {
        ajax_action: "UPDTAE_EMPLOYEE",
        enm: emp_name,
        edb: emp_date_of_birth,
        emn: emp_mother_name,
        efn: emp_father_name,
        emb: emp_mobile,
        eeml: emp_email,
        ebg: blood_group,
        eprl: emp_payroll,
        edtj: emp_date_of_join,
        ermk: emp_remarks,
        exp: emp_exp,
        edgn: emp_desig_id,
        emp_esic_ip_number,
        emp_uan,
        emp_salary_ac_ifsc,
        emp_salary_ac_number,
        emp_pan,
        emp_aadhaar,
        permanent_address,
        current_address,
        emergeny_contact_mobile,
        emergeny_contact_name,
        emp_webmail,
        emp_salary,
        emp_department,
        emp_id,
        emp_row_id: $("#emp_update_btn").attr("data-id"),
        emp_rprt_tm: employee_report_time
    };
    clog(data);
    // return false;
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, 'error');
            loader.hide();
            return false;
        }
        toastAlert(msg);
        loader.hide();
        window.location.href = HOST_URL + 'auditors';
        return false;
    });
});
$("#empProfileUpdate").on("click",()=>{auditorAdminSelfProfileUpdate();});
const auditorAdminSelfProfileUpdate = () => {
    const
        $audAdmin_name = $("#audAdmin_name"),
        $audAdmin_desig = $("#audAdmin_desig"),
        $audAdmin_dept = $("#audAdmin_dept"),
        $audAdmin_emp_id = $("#audAdmin_emp_id"),
        $audAdmin_mobile = $("#audAdmin_mobile"),
        $audAdmin_email = $("#audAdmin_email"),
        loader = $("#audAdminSelfProfileLoader");
    var
        audAdmin_name = $audAdmin_name.val(),
        audAdmin_emp_id = $audAdmin_emp_id.val(),
        audAdmin_mobile = $audAdmin_mobile.val(),
        audAdmin_email = $audAdmin_email.val(),
        audAdmin_desig = $audAdmin_desig.children("option:selected").val(),
        audAdmin_dept = $audAdmin_dept.children("option:selected").val();
    $audAdmin_name.removeClass("error_input");
    $audAdmin_mobile.removeClass("error_input");
    $audAdmin_email.removeClass("error_input");
    if (isInvalidValue(audAdmin_name,true)) {
        pointInvalid($audAdmin_name);
        toastAlert("Name cannot be left blank","error");
        return false;
    }
    if (isInvalidValue(audAdmin_mobile,true)) {
        pointInvalid($audAdmin_mobile);
        toastAlert("Mobile cannot be left blank","error");
        return false;
    } else {
        if (isNaN(audAdmin_mobile)) {
            pointInvalid($audAdmin_mobile);
            toastAlert("Please enter a valid mobile number","error");
            return false;
        }
        // if (audAdmin_mobile.length<10) {
        //     pointInvalid($audAdmin_mobile);
        //     toastAlert("Please enter a valid mobile number","error");
        //     return false;
        // }
    }
    if (isInvalidValue(audAdmin_email,true)) {
        pointInvalid($audAdmin_email);
        toastAlert("Email cannot be left blank","error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"EMP_SELF_PROFILE_UPDATE",
        nm:audAdmin_name,
        mb:audAdmin_mobile,
        em:audAdmin_email
    },(res)=>{
        if (res.error) {
            loader.hide();
            toastAlert(res.message,"error");
            return false;
        }
        toastAlert(res.message);
        setTimeout(() => {
            loader.hide();
            location.reload();
            return false;
        }, 1000);
    });
    //self profile updation function
};

$("#admin_profile_update").on('click', () => {
    const $admin_profile_name = $("#admin_profile_name"),
        $admin_profile_email = $("#admin_profile_email"),
        $admin_profile_mobile = $("#admin_profile_mobile"),
        loader = $("#profile_loader");

    var admin_profile_mobile = $admin_profile_mobile.val(),
        admin_profile_name = $admin_profile_name.val(),
        admin_profile_email = $admin_profile_email.val();

    $admin_profile_name.removeClass('error_input');
    $admin_profile_email.removeClass('error_input');
    $admin_profile_mobile.removeClass('error_input');

    if (isInvalidValue(admin_profile_name)) {
        pointInvalid($admin_profile_name);
        toastAlert("Name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(admin_profile_email)) {
        pointInvalid($admin_profile_email);
        toastAlert("Email cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(admin_profile_mobile)) {
        // pointInvalid($admin_profile_mobile);
        // toastAlert("Mobile cannot be left blank", "error");
        // return false;
    } else {
        if (isNaN(admin_profile_mobile)) {
            pointInvalid($admin_profile_mobile);
            toastAlert("Please insert a valid mobile number", 'error');
            return false;
        }
    }
    loader.showLoader();
    const data = {
        ajax_action: "UPDATE_PROFILE",
        nm: admin_profile_name,
        em: admin_profile_email,
        mb: admin_profile_mobile
    };
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        setInterval(() => {
            location.reload();
            return false;
        }, 1000);
        return false;
    });

});

const initiateDelete = (id, action) => {
    const modal = $("#delete_modal"),
        delete_id = $("#delete_id"),
        modal_body = modal.find(".modal-body");

    var body = `
    <div class="row">
        <div class="col-12 text-center" style="margin-bottom:10px;"><i>Are sure you want to delete this item?</i></div>
        <div class="col-6 text-right">
            <button type="button" class="btn btn-danger" id="delete_confirm" onclick="deleteData(${id}, '${action}');">Delete</button>
        </div>
        <div class="col-6 text-left">
            <button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close" id="delete_cancel">Cancel</button>
        </div>
    </div>
    `;
    // if (CURRENT_USER_TYPE != SADMIN) {
    //     body = `
    //     <div class="row">
    //         <div class="col-12 text-center" style="margin-bottom:10px;"><i>You are not allowed to perform this action</i></div>
    //     </div>
    //     `;
    // }

    delete_id.val('');
    modal_body.html('');
    delete_id.val(id);
    modal_body.html(body);
    modal.modal('show');
}

const deleteData = (id, action) => {
    const modal = $("#delete_modal"),
        delete_id = $("#delete_id"),
        modal_body = modal.find(".modal-body"),
        table = $("." + action + "_table"),
        data = {
            ajax_action: "DELETE_ITEM",
            id: id,
            action: action
        };
    ajaxRequest(data, (res) => {
        var err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, 'error');
            modal.modal('hide');
            return false;
        }
        toastAlert(msg);
        modal.modal('hide');
        table.find('tbody').find("#" + action + "_" + id).addClass("animated fadeOut");
        setTimeout(() => {
            table.find('tbody').find("#" + action + "_" + id).remove();
            return false;
        }, 1000);

    });
};

// $("#address_samem_check")
if (document.getElementById("address_samem_check")) {
    document.getElementById("address_samem_check").addEventListener('change', e => {
        const current_address = $("#current_address"),
            permanent_address = $("#permanent_address");

        if (e.target.checked === true) {
            permanent_address.val(current_address.val());
        }
        if (e.target.checked === false) {
            //do nothing
        }
    });
}

const enterExpectedCompleteDate = (cid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    var ht = `
    <fieldset class="fldset mt-3">
        <legend>Close Date Details</legend>
        <div class="row">
            <div class="col-md-7">
                <label class="form_label" for="audit_expected_complete_date">Expected Complete Date</label>${getAsterics()}
                <input type="date" class="form-control" id="audit_expected_complete_date" />
            </div>
            <div class="col-md-5 text-right mt-4">
                <button class="btn btn-sm btn-success" type="button" onclick="StartAudit(${cid})">Start</button>
            </div>
        </div>
    </fieldset>
    `;
    $commonModalLabel.text("Enter Audit Expected Close Date");
    $modal_body.html(ht);
    loader.hide();
};

const StartAudit = (id) => {
    const
        loader = $("#audits_table_loader"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        $audit_expected_complete_date = $("#audit_expected_complete_date");
    var
        audit_expected_complete_date = $audit_expected_complete_date.val();
    $audit_expected_complete_date.removeClass('error_input');
    if (isInvalidValue(audit_expected_complete_date)) {
        pointInvalid($audit_expected_complete_date);
        toastAlert("Expected close date cannot be left blank!", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "START_AUDIT",
        cid: id,
        ed: audit_expected_complete_date
    }, (res) => {
        loader.hide();
        let err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        var btn = `
        <span>Started: <em>${res.st_date}</em></span>
        <br><button class="btn btn-sm btn-danger" type="button">Close</button>
        `;
        $(".audits_table").find("tbody").find("#company_list_" + id).find(".audit_btn").html(btn);
        $commonModal.modal('hide');
        getAuditorsAuditTable();
        return false;
    });
};

const closeAudit = (cid) => {
    const loader = $("#audits_table_loader");
    const data = {
        ajax_action: "CLOSE_AUDIT",
        cid
    };
    loader.showLoader();
    ajaxRequest(data, (res) => {
        let
            err = res.error,
            approvalRequired = res.approvalRequired,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        if (approvalRequired) {
            $("#audit_id_for_close").val(res.audit_id);
            $("#auditCloseReqAuditor_modal").modal('show');
            return false;
        }
        toastAlert(msg);
        getAuditorsAuditTable();
        return false;
    });
};

const editAuditCloseDate = (aid, acldate) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    var ht = `
    <fieldset class="fldset mt-3">
        <legend>Close Date Details</legend>
        <div class="row">
            <div class="col-md-7">
                <label class="form_label" for="audit_edited_close_date">Close Date</label>${getAsterics()}
                <input type="date" class="form-control" id="audit_edited_close_date" value="${acldate}" />
            </div>
            <div class="col-md-5 text-right mt-4">
                <button class="btn btn-sm btn-success" type="button" onclick="saveEditedCloseDate(${aid},${acldate})"><i class="far fa-edit"></i>&nbsp;Update</button>
            </div>
        </div>
    </fieldset>
    `;
    $commonModalLabel.text("Edit Audit Close Date");
    $modal_body.html(ht);
    loader.hide();
};

const saveEditedCloseDate = (aid, acldate) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        $audit_edited_close_date = $commonModal.find("#audit_edited_close_date"),
        loader = $("#commonModalLoader");
    var
        audit_edited_close_date = $audit_edited_close_date.val();
    $audit_edited_close_date.removeClass("error_input");
    if (isInvalidValue(audit_edited_close_date)) {
        pointInvalid($audit_edited_close_date);
        toastAlert("Please enter a valid date", "error");
        return false;
    }
    if (audit_edited_close_date == acldate) {
        pointInvalid($audit_edited_close_date);
        toastAlert("The entered date is the same as the existing close date", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_EDITED_AUDIT_CLOSE_DATE",
        aid,
        dt: audit_edited_close_date
    }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        loader.hide();
        $commonModal.modal('hide');
        getAuditorsAuditTable();
        return false;
    });
};

$("#auditCloseReqAuditorSubmit").on('click', () => {
    const
        modal = $("#auditCloseReqAuditor_modal"),
        $auditCloseReqAuditorReason = $("#auditCloseReqAuditorReason"),
        $audit_id_for_close = $("#audit_id_for_close"),
        loader = $("#auditCloseReqAuditorLoader");
    var
        auditCloseReqAuditorReason = $auditCloseReqAuditorReason.val(),
        audit_id_for_close = $audit_id_for_close.val();
    $auditCloseReqAuditorReason.removeClass("error_input");
    if (isInvalidValue(auditCloseReqAuditorReason, true)) {
        pointInvalid($auditCloseReqAuditorReason);
        toastAlert("Reason field cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(audit_id_for_close, true)) {
        toastAlert("Audit Not Found !", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "AUDIT_CLOSE_REQUEST_SUBMIT", reason: auditCloseReqAuditorReason, audid: audit_id_for_close }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        modal.modal('hide');
        $auditCloseReqAuditorReason.val('');
        $audit_id_for_close.val(0);
        getAuditorsAuditTable();
        return false;
    });
});

$(document).on("click", ".audit_nav", function() {
    const $query_nav_btn = $(".query_nav_btn"),
        $query_table_col = $(".query_table_col"),
        $audit_closed_alert = $(".audit_closed_alert"),
        $add_query_col = $(".add_query_col"),
        //Notice consts
        $list_nav_btn = $("#list_nav_btn"),
        $add_notice_sec = $("#add_notice_sec"),
        $view_notice_sec = $("#view_notice_sec"),
        // Position-paper Section
        $position_paper_query_select_sec = $('#position_paper_query_select_sec'),
        $position_list_nav = $('#position-list-nav'),
        $info_position_sec = $('#info-position-sec'),
        $query_force_close_sec = $('#query_force_close_sec'),
        $view_position_sec = $('#view-position-sec'),
        $add_position_sec = $('#add-position-sec'),
        //Assessment Section
        $assessment_query_select_sec = $('#assessment_query_select_sec'),
        $assessment_list_nav = $('#assessment-list-nav'),
        $info_assessment_sec = $('#info-assessment-sec'),
        $view_assessment_sec = $('#view-assessment-sec'),
        $add_assessment_sec = $('#add-assessment-sec');
        //Memo Section
        // $audit_closed_alert = $(".audit_closed_alert"),
        $memo_nav_btn = $('.memo_nav_btn'),
        $view_memo_col = $('#view_memo_col'),
        $add_memo_col = $('#add_memo_col');
    var btn = `
        <button type="button" class="btn btn-sm btn-primary" id="add_query_btn" onclick="addQueryNav();" disabled style="cursor:not-allowed;"><small><i class="fas fa-plus"></i>&nbsp;Add Query</small></button>
    `,
        dtt = $(this).attr("data-target");
    console.log("This Data Printing: " + dtt);
    window.location.hash = dtt;
    var active_audit_companies = '',
        select_company = $(".select_company");
    ajaxRequest({ ajax_action: "GET_ACTIVE_AUDIT_COMPANIES", dtt }, (res) => {
        if (!res.error) {
            select_company.html(res.active_audit_companies);
            $query_nav_btn.html(btn);
            $query_table_col.hide();
            $audit_closed_alert.hide();
            $add_query_col.hide();
            //Notice section
            $list_nav_btn.children('.btn').prop('disabled', true);
            $list_nav_btn.children('.btn').css('cursor', 'not-allowed');
            $add_notice_sec.hide();
            $view_notice_sec.hide();
            // Position-paper Section
            $position_paper_query_select_sec.html('');
            $position_list_nav.children('.btn').prop('disabled', true);
            $position_list_nav.children('.btn').css('cursor', 'not-allowed');
            $info_position_sec.show();
            $query_force_close_sec.hide();
            $view_position_sec.hide();
            $add_position_sec.hide();
            // Assessment-paper Section
            $assessment_query_select_sec.html('');
            $assessment_list_nav.children('.btn').prop('disabled', true);
            $assessment_list_nav.children('.btn').css('cursor', 'not-allowed');
            $info_assessment_sec.show();
            $view_assessment_sec.hide();
            $add_assessment_sec.hide();
            // Memo Section Section
            $memo_nav_btn.children('.btn').prop('disabled', true);
            $memo_nav_btn.children('.btn').css('cursor', 'not-allowed');
            $view_memo_col.hide();
            $add_memo_col.hide();
            $audit_closed_alert.hide();
        }
    });
    const
        auditAllSectionStatLoader = $("#auditAllSectionStatLoader");
    // var hash = window.location.hash;
    if ((hash == "#audit")||(hash == "#assessment")||(hash == "#memo")) {
        $("#auditStatCard").hide();
    } else {
        // $("#auditStatCard").show();
        // auditAllSectionStatloader.showLoader();
        getAllSectionStats();
    }
});
const getQueryTableData = () => {
    const $query_section_company_select = $("#query_section_company_select"),
        $query_table_col = $(".query_table_col"),
        $audit_closed_alert = $(".audit_closed_alert"),
        $query_nav_btn = $(".query_nav_btn"),
        $add_query_btn = $query_nav_btn.find("#add_query_btn"),
        loader = $("#query_table_loader");
    var query_section_company_select = $query_section_company_select.children("option:selected").val();
    $query_section_company_select.removeClass("error_input");

    if (isInvalidValue(query_section_company_select, true)) {
        pointInvalid($query_section_company_select);
        toastAlert("Please select a company to proceed.", "error");
        return false;
    }
    loader.showLoader();
    $audit_closed_alert.hide();
    ajaxRequest({
        ajax_action: "GET_QUERY_DETAILS",
        cid: query_section_company_select
    }, (res) => {
        $query_table_col.find('.query_table').find('tbody').html(res.query_row);
        // $query_table_col.show();
        $query_nav_btn.find('.btn').removeClass(TOOLTIP_CLASS);
        $query_nav_btn.find('.btn').attr('title', "");
        if (res.audit_closed) {
            $audit_closed_alert.show();
            $query_nav_btn.find('.btn').attr('disabled', true);
            $query_nav_btn.find('.btn').css('cursor', 'not-allowed');
            $query_nav_btn.find('.btn').addClass(TOOLTIP_CLASS);
            $query_nav_btn.find('.btn').attr('title', "Audit Has been Closed ! Cannot Raise Query Now.");
        }
        if (res.company_inactive) {
            $query_nav_btn.find('.btn').attr('disabled', true);
            $query_nav_btn.find('.btn').css('cursor', 'not-allowed');
            $query_nav_btn.find('.btn').addClass(TOOLTIP_CLASS);
            $query_nav_btn.find('.btn').attr('title', "Company is inactive now !");
        }
        $("." + TOOLTIP_CLASS).tooltip();
        loader.hide();
    });
};
$("#query_section_company_select").on("change", () => {
    const $query_section_company_select = $("#query_section_company_select"),
        $query_table_col = $(".query_table_col"),
        $query_nav_btn = $(".query_nav_btn"),
        loader = $("#query_table_loader");
    $query_nav_btn.find('.btn').attr('disabled', false);
    $query_nav_btn.find('.btn').css('cursor', 'pointer');
    $query_nav_btn.find('.btn').removeClass(TOOLTIP_CLASS);
    $query_nav_btn.find('.btn').attr('title', "");
    viewQueryNav();
});


const addQueryNav = () => {
    const
        $query_section_company_select = $("#query_section_company_select"),
        $query_nav_btn = $(".query_nav_btn"),
        $query_table_col = $(".query_table_col"),
        $add_query_col = $(".add_query_col"),
        $query_memo_select_section = $(".query_memo_select_section"),
        $query_no = $("#query_no"),
        $case_code = $("#case_code"),
        $total_no_of_query = $("#total_no_of_query"),
        $date_of_issue = $("#date_of_issue"),
        $audit_type_id = $("#audit_type_id"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $days_to_reply = $("#days_to_reply"),
        $query_audit_type_field = $("#query_audit_type_field"),
        $query_tax_type_field = $("#query_tax_type_field");
    var
        btn = `
        <button type="button" class="btn btn-sm btn-primary" id="view_query_btn" onclick="viewQueryNav();"><small><i class="fas fa-list-ul"></i>&nbsp;View Queries</small></button>
    `,
        query_section_company_select = $query_section_company_select.children("option:selected").val();

    $query_no.val("");
    $case_code.val("");
    $total_no_of_query.val("");
    $audit_type_id.val(0);
    $type_of_tax_id.val(0);
    $days_to_reply.val("");

    $query_no.prop('disabled',false);

    $query_nav_btn.html(btn);
    $query_table_col.hide();
    $add_query_col.show();
    $query_section_company_select.removeClass("error_input");
    $query_memo_select_section.html("");
    if (isInvalidValue(query_section_company_select, true)) {
        pointInvalid($query_section_company_select);
        toastAlert("Please select a company to proceed.", "error");
        return false;
    }
    ajaxRequest({ ajax_action: "GET_MEMO_SELECT_TO_QUERY", cid: query_section_company_select }, (res) => {
        if (res.count > 0) {
            $query_memo_select_section.html(res.select);
            $("." + TOOLTIP_CLASS).tooltip();
            toastAlert("You have unused Memos on this company !", "info");
            $('.multiple').select2();
            // return false;
        }
    });
    if (!(isInvalidValue(query_section_company_select, true))) {
        ajaxRequest({
            ajax_action: "GET_TAX_AUDIT_TYPE_FOR_QUERY",
            cid: query_section_company_select
        }, (res) => {
            // if (res.count) {
            $query_audit_type_field.html(res.audt);
            $query_tax_type_field.html(res.taxt);
            // }
        });
        ajaxRequest({ajax_action:"GET_QUERY_NO"},(res)=>{
            if (res.error) {
                toastAlert(res.message,"error");
                return false;
            }
            if ((res.found)&&(res.enabled)) {
                $query_no.prop('disabled',true);
                $("#query_auto_no").val(res.qno);
                $query_no.val(res.suf+''+res.qno+''+res.pref);
            }
        });
    }
    $('.multiple').select2();
};
const viewQueryNav = () => {
    const $query_nav_btn = $(".query_nav_btn"),
        $query_table_col = $(".query_table_col"),
        $add_query_col = $(".add_query_col"),
        $audit_closed_alert = $(".audit_closed_alert"),
        $query_audit_type_field = $(".query_audit_type_field"),
        $query_tax_type_field = $(".query_tax_type_field"),
        $query_section_company_select = $(".query_section_company_select");
    var btn = `
        <button type="button" class="btn btn-sm btn-primary" id="add_query_btn" onclick="addQueryNav();"><small><i class="fas fa-plus"></i>&nbsp;Add Query</small></button>
    `,
        query_section_company_select = $query_section_company_select.children("option:selected").val();

    $query_nav_btn.html(btn);
    getQueryTableData();
    $query_table_col.show();
    $add_query_col.hide();
};

const editExtRequest=(eid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModalLabel.html("Edit Query Extension Request");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({ajax_action:"GET_QUERY_EXTENSION_REQUEST_DATA_TO_EDIT",eid},(res)=>{
        loader.hide();
        if (res.error) {
            $commonModal.modal('hide');
            toastAlert(res.message,"error");
            return false;
        }
        $modal_body.html(res.str);
        return false;
    });
};

const updateQueryExt=(eid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        $edit_extension_start_date=$("#edit_extension_start_date"),
        $edit_extension_days=$("#edit_extension_days"),
        $edit_extension_end_date=$("#edit_extension_end_date"),
        loader = $("#commonModalLoader");
    var
        edit_extension_start_date=$edit_extension_start_date.val(),
        edit_extension_days=$edit_extension_days.val(),
        edit_extension_end_date=$edit_extension_end_date.val();
    $edit_extension_start_date.removeClass("error_input");
    $edit_extension_days.removeClass("error_input");
    $edit_extension_end_date.removeClass("error_input");
    if (isInvalidValue(edit_extension_start_date)) {
        pointInvalid($edit_extension_start_date);
        toastAlert("Extension start date cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(edit_extension_days,true)) {
        pointInvalid($edit_extension_days);
        toastAlert("Extension days cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(edit_extension_end_date)) {
        pointInvalid($edit_extension_end_date);
        toastAlert("Extension end date cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_QUERY_EXT_REQ",
        st:edit_extension_start_date,
        dys:edit_extension_days,
        endt:edit_extension_end_date,
        eid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            return false;
        }
        $commonModal.modal('hide');
        toastAlert(res.message);
        getQueryTableData();
        getAllSectionStats();
        return false;
    });
};

$("#save_query_btn").on("click", () => {
    const
        $query_section_company_select = $("#query_section_company_select"),
        $query_no = $("#query_no"),
        $case_code = $("#case_code"),
        $total_no_of_query = $("#total_no_of_query"),
        $date_of_issue = $("#date_of_issue"),
        $end_date_of_reply = $("#end_date_of_reply"),
        $audit_type_id = $("#audit_type_id"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $days_to_reply = $("#days_to_reply"),
        $query_auto_no = $("#query_auto_no"),
        loader = $("#queryLoader");
    var
        query_no = $query_no.val(),
        case_code = $case_code.val(),
        total_no_of_query = $total_no_of_query.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        audit_type_id = $audit_type_id.children("option:selected").val(),
        type_of_tax_id = $type_of_tax_id.children("option:selected").val(),
        days_to_reply = $days_to_reply.val(),
        query_auto_no = $query_auto_no.val(),
        query_section_company_select = $query_section_company_select.children("option:selected").val();

    $date_of_issue.removeClass("error_input");
    $query_no.removeClass("error_input");
    $type_of_tax_id.removeClass("error_input");
    $audit_type_id.removeClass("error_input");

    if (isInvalidValue(query_no)) {
        pointInvalid($query_no);
        toastAlert("Please fill the Query No.", "error");
        return false;
    }
    if (isInvalidValue(total_no_of_query)) {
        pointInvalid($total_no_of_query);
        toastAlert("Total no. Query cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(date_of_issue)) {
        pointInvalid($date_of_issue);
        toastAlert("Please select the issue Date", "error");
        return false;
    }
    if (isInvalidValue(end_date_of_reply)) {
        pointInvalid($end_date_of_reply);
        toastAlert("Please select the last date to reply", "error");
        return false;
    }
    if (isInvalidValue(days_to_reply)) {
        pointInvalid($days_to_reply);
        toastAlert("Please enter the days to reply", "error");
        return false;
    }
    if (isInvalidValue(audit_type_id, true)) {
        pointInvalid($audit_type_id);
        toastAlert("Audit type cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(type_of_tax_id, true)) {
        pointInvalid($type_of_tax_id);
        toastAlert("Tax type cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "ADD_QUERY",
        qno: query_no,
        // cc: case_code,
        noq: total_no_of_query,
        doi: date_of_issue,
        ldor: end_date_of_reply,

        atype: audit_type_id,
        ttype: type_of_tax_id,

        dtr: days_to_reply,
        com: query_section_company_select,
        qaln:query_auto_no,
        mid: ($("#query_section_memo_select").length) ? $("#query_section_memo_select").val() : []
    };
    ajaxRequest(data, (res) => {
        loader.hide();
        let err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        // getQueryTableData();
        viewQueryNav();
        getAllSectionStats();
        return false;
    });
});

const editQuery=(qid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
        // alert("Under Development !");
    $commonModal.modal('show');
    $commonModalLabel.html('Edit Query Details');
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    loader.showLoader();
    ajaxRequest({ajax_action:"GET_QUERY_EDIT_FIELDS",qid},(res)=>{
        if (res.error) {
            loader.hide();
            $commonModal.modal('hide');
            toastAlert(res.message,"error");
            return false;
        }
        $modal_body.html(res.htm);
        $("." + TOOLTIP_CLASS).tooltip();
        $('.multiple').select2();
        loader.hide();
    });

};

const updateQuery = (qid,cid) =>{
    const
    $query_no = $("#edit_query_no"),
    $total_no_of_query = $("#edit_total_no_of_query"),
    $date_of_issue = $("#edit_date_of_issue"),
    $end_date_of_reply = $("#edit_end_date_of_reply"),
    $audit_type_id = $("#edit_audit_type_id"), //select box
    $type_of_tax_id = $("#edit_type_of_tax_id"), //select box
    $days_to_reply = $("#edit_days_to_reply"),
    $commonModal = $("#commonModal"),
    $commonModalLabel = $("#commonModalLabel"),
    $modal_body = $commonModal.find(".modal-body"),
    $modal_footer = $commonModal.find(".modal-footer"),
    loader = $("#commonModalLoader");
var
    query_no = $query_no.val(),
    total_no_of_query = $total_no_of_query.val(),
    date_of_issue = $date_of_issue.val(),
    end_date_of_reply = $end_date_of_reply.val(),
    audit_type_id = $audit_type_id.children("option:selected").val(),
    type_of_tax_id = $type_of_tax_id.children("option:selected").val(),
    days_to_reply = $days_to_reply.val();

    $date_of_issue.removeClass("error_input");
    $query_no.removeClass("error_input");
    $type_of_tax_id.removeClass("error_input");
    $audit_type_id.removeClass("error_input");

    if (isInvalidValue(query_no)) {
        pointInvalid($query_no);
        toastAlert("Please fill the Query No.", "error");
        return false;
    }
    if (isInvalidValue(total_no_of_query)) {
        pointInvalid($total_no_of_query);
        toastAlert("Total no. Query cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(date_of_issue)) {
        pointInvalid($date_of_issue);
        toastAlert("Please select the issue Date", "error");
        return false;
    }
    if (isInvalidValue(end_date_of_reply)) {
        pointInvalid($end_date_of_reply);
        toastAlert("Please select the last date to reply", "error");
        return false;
    }
    if (isInvalidValue(days_to_reply)) {
        pointInvalid($days_to_reply);
        toastAlert("Please enter the days to reply", "error");
        return false;
    }
    if (isInvalidValue(audit_type_id, true)) {
        pointInvalid($audit_type_id);
        toastAlert("Audit type cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(type_of_tax_id, true)) {
        pointInvalid($type_of_tax_id);
        toastAlert("Tax type cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "UPDATE_QUERY",
        qno: query_no,
        // cc: case_code,
        noq: total_no_of_query,
        doi: date_of_issue,
        ldor: end_date_of_reply,

        atype: audit_type_id,
        ttype: type_of_tax_id,

        dtr: days_to_reply,
        cid,
        qid,
        mid: ($("#edit_query_section_memo_select").length) ? $("#edit_query_section_memo_select").val() : []
    };
    ajaxRequest(data,(res)=>{
        let
            err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg,"error");
            return false;
        }
        toastAlert(msg);
        $commonModal.modal('hide');
        viewQueryNav();
        getAllSectionStats();
        return false;
    });
}

$("#save_com_industry_btn").on("click", () => {
    const
        $com_industry_name = $("#com_industry_name"),
        $com_industry_list_table = $(".com_industry_list_table"),
        tbody = $com_industry_list_table.find('tbody'),
        loader = $("#com_industry_loader"),
        company_industry_table_loader = $("#company_industry_table_loader");
    var
        com_industry_name = $com_industry_name.val();

    $com_industry_name.removeClass("error_input");

    if (isInvalidValue(com_industry_name)) {
        pointInvalid($com_industry_name);
        toastAlert("Industry name cannot be left blank", "error");
        return false;
    }

    loader.showLoader();
    const data = {
        ajax_action: "SAVE_COMPANY_INDUSTRY",
        ci_nm: com_industry_name
    };
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        company_industry_table_loader.showLoader();
        toastAlert(msg);
        tbody.html(res.table);
        company_industry_table_loader.hide();
        $com_industry_name.val('');
        return false;
    });
});
$("#save_audit_type_btn").on("click", () => {
    const
        $audit_type_name = $("#audit_type_name"),
        $audit_type_table = $(".audit_type_table"),
        tbody = $audit_type_table.find('tbody'),
        loader = $("#auditTypeLoader"),
        audit_type_table_loader = $("#audit_type_table_loader");
    var
        audit_type_name = $audit_type_name.val();

    $audit_type_name.removeClass("error_input");

    if (isInvalidValue(audit_type_name)) {
        pointInvalid($audit_type_name);
        toastAlert("Audit type name cannot be left blank", "error");
        return false;
    }

    loader.showLoader();
    const data = {
        ajax_action: "SAVE_AUDIT_TYPE",
        ci_nm: audit_type_name
    };
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        audit_type_table_loader.showLoader();
        toastAlert(msg);
        tbody.html(res.table);
        audit_type_table_loader.hide();
        $audit_type_name.val('');
        return false;
    });
});
$("#save_tax_type_btn").on("click", () => {
    const
        $tax_type_name = $("#tax_type_name"),
        $tax_type_table = $(".tax_type_table"),
        tbody = $tax_type_table.find('tbody'),
        loader = $("#taxTypeLoader"),
        tax_type_table_loader = $("#tax_type_table_loader");
    var
        tax_type_name = $tax_type_name.val();

    $tax_type_name.removeClass("error_input");

    if (isInvalidValue(tax_type_name)) {
        pointInvalid($tax_type_name);
        toastAlert("Tax type name cannot be left blank", "error");
        return false;
    }

    loader.showLoader();
    const data = {
        ajax_action: "SAVE_TAX_TYPE",
        ci_nm: tax_type_name
    };
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        tax_type_table_loader.showLoader();
        toastAlert(msg);
        tbody.html(res.table);
        tax_type_table_loader.hide();
        $tax_type_name.val('');
        return false;
    });
});

$("#save_company_btn").on("click", () => {
    const
        $com_name = $("#com_name"),
        $com_tin_number = $("#com_tin_number"),
        $company_code = $("#company_code"),
        $com_case_code = $("#com_case_code"),
        $com_industry_type_select = $("#com_industry_type_select"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $audit_type_id = $("#audit_type_id"), //select box
        loader = $("#com_add_loader");
    var
        com_name = $com_name.val(),
        com_tin_number = $com_tin_number.val(),
        company_code = $company_code.val(),
        com_case_code = $com_case_code.val(),
        com_industry_type_select = $com_industry_type_select.children('option:selected').val(),
        audit_type_id = $audit_type_id.children('option:selected').val(),
        type_of_tax_id = $type_of_tax_id.children('option:selected').val();

    $com_name.removeClass("error_input");
    $com_tin_number.removeClass("error_input");
    $type_of_tax_id.removeClass("error_input");
    $audit_type_id.removeClass("error_input");

    if (isInvalidValue(com_name)) {
        pointInvalid($com_name);
        toastAlert("Company name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(com_tin_number)) {
        pointInvalid($com_tin_number);
        toastAlert("Company TIN name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(audit_type_id, true)) {
        pointInvalid($audit_type_id);
        toastAlert("Audit type cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(type_of_tax_id, true)) {
        pointInvalid($type_of_tax_id);
        toastAlert("Tax type cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "SAVE_COMPANY",
        cname: com_name,
        ctin: com_tin_number,
        citype: com_industry_type_select,
        ccode: company_code,
        ccase: com_case_code,
        atype: audit_type_id,
        ttype: ($type_of_tax_id.prop("multiple")) ? ($("select[name='type_of_tax_id[]']").val()) : type_of_tax_id
    };
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        toastAlert(msg);
        let si = setInterval(() => {
            loader.hide();
            clearInterval(si);
            location.reload();
            return false;
        }, 1000);
    });
});

const updateCompany = (cid, cdata) => {
    const
        $com_name = $("#com_name"),
        $com_tin_number = $("#com_tin_number"),
        $company_code = $("#company_code"),
        $com_case_code = $("#com_case_code"),
        $com_industry_type_select = $("#com_industry_type_select"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $audit_type_id = $("#audit_type_id"), //select box
        loader = $("#com_add_loader");
    loader.showLoader();
    $("#add_company_row").show();
    $("#view_company_row").hide();
    ajaxRequest({ ajax_action: "EDIT_COMPANY", cid: cid }, (res) => {
        $("#add_company_row").html(res.html);
        $("#list_nav_btn").find(".btn").hide();
        loader.hide();
        $('.multiple').select2();
    });
};

const updateSubmitCompany = (cid) => {
    const
        $com_name = $("#com_name"),
        $com_tin_number = $("#com_tin_number"),
        $company_code = $("#company_code"),
        $com_case_code = $("#com_case_code"),
        $com_industry_type_select = $("#com_industry_type_select"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $audit_type_id = $("#audit_type_id"), //select box
        loader = $("#com_add_loader");
    var
        com_name = $com_name.val(),
        com_tin_number = $com_tin_number.val(),
        company_code = $company_code.val(),
        com_case_code = $com_case_code.val(),
        com_industry_type_select = $com_industry_type_select.children('option:selected').val(),
        audit_type_id = $audit_type_id.children('option:selected').val(),
        type_of_tax_id = $type_of_tax_id.children('option:selected').val();

    $com_name.removeClass("error_input");
    $com_tin_number.removeClass("error_input");
    $type_of_tax_id.removeClass("error_input");
    $audit_type_id.removeClass("error_input");

    if (isInvalidValue(com_name)) {
        pointInvalid($com_name);
        toastAlert("Company name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(com_tin_number)) {
        pointInvalid($com_tin_number);
        toastAlert("Company TIN name cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(audit_type_id, true)) {
        pointInvalid($audit_type_id);
        toastAlert("Audit type cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(type_of_tax_id, true)) {
        pointInvalid($type_of_tax_id);
        toastAlert("Tax type cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "UPDATE_COMPANY",
        cid,
        cname: com_name,
        ctin: com_tin_number,
        citype: com_industry_type_select,
        ccode: company_code,
        ccase: com_case_code,
        atype: audit_type_id,
        ttype: ($type_of_tax_id.prop("multiple")) ? ($("select[name='type_of_tax_id[]']").val()) : type_of_tax_id
    };
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        toastAlert(msg);
        let si = setInterval(() => {
            loader.hide();
            clearInterval(si);
            location.reload();
            return false;
        }, 1000);
    });
};

const setTaxtype = () => {
    const
        $audit_type_id = $("#audit_type_id"),
        $tax_type_select_div = $(".tax_type_select_div");
    var
        audit_type_id = $audit_type_id.children("option:selected").val(),
        audit_type = $audit_type_id.children("option:selected").text();

    if ((audit_type_id == 0) || (audit_type_id == "")) {
        return false;
    }
    ajaxRequest({ ajax_action: "GET_TAX_TYPE_OPTIONS" }, (res) => {
        var sel = ``,
            multiple = false;
        if (audit_type == "Comprehensive audit") {
            multiple = true;
            // $('.multiple').select2();
            // $type_of_tax_id.addClass('multiple');
            // $type_of_tax_id.attr('multiple', 'multiple');
            // $('.multiple').select2();
            sel = `
            <select id="type_of_tax_id" class="form-control multiple" name="type_of_tax_id[]" multiple="multiple">
                <option value="0" disabled>--- Select Tax Type ---</option>
                ${res.taxTypeOptions}
            </select>
            `;
        } else {
            multiple = false;
            // $type_of_tax_id.removeClass('multiple');
            // $type_of_tax_id.attr('multiple', false);
            sel = `
            <select id="type_of_tax_id" class="form-control">
                <option value="0" disabled selected>--- Select Tax Type ---</option>
                ${res.taxTypeOptions}
            </select>
            `;
        }
        $tax_type_select_div.html(sel);
        if (multiple) {
            $('.multiple').select2();
        }
        return false;
    });
};

const getAssignedCompanyDetails = () => {
    const
        $assign_auditor_select = $("#assign_auditor_select"),
        $assigned_result = $(".assigned_result"),
        loader = $("#AssignedComLoader");
    var
        assign_auditor_select = $assign_auditor_select.children("option:selected").val();

    if (assign_auditor_select == 0 || assign_auditor_select == "") {
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_ASSIGNED_COMPANIES",
        aud: assign_auditor_select
    }, (res) => {
        $assigned_result.html(res.assigned);
        loader.hide();
    });
};

const assignCompanySection = () => {
    const
        $assign_auditor_select = $("#assign_auditor_select"),
        $assigned_result = $(".assigned_result"),
        $is_update = $("#is_update"),
        loader = $("#AssignedComLoader");
    var
        assign_auditor_select = $assign_auditor_select.children("option:selected").val();
    loader.showLoader();
    $is_update.val(0);
    ajaxRequest({
        ajax_action: "GET_COMPANY_LIST_TO_ASSIGN",
        aud: assign_auditor_select
    }, (res) => {
        list = res.list;
        var str = `
        <div class="row">
            <div class="col-md-6">
                <div class="form-outline">
                    <label class="form_label" for="com_sel_to_assign">Select Companies</label>
                    ${list}
                </div>
            </div>
            <div class="col-md-6">
                <button type="button" class="btn btn-sm btn-success mt-4" onclick="saveAssignedCompanies();" id="assignCompaniesBtn">Assign</button>
            </div>
        </div>
        `;
        $assigned_result.html(list);
        loader.hide();
        $(".multiple").select2();
        // $("#com_sel_to_assign").focus();
        // if (res.primary_aud_id == 0) {
        //     $("#primary_auditor_select").val(0).change();
        // }
        var isSel = true;
        $("#primary_auditor_select option").each(function() {
            // str += $(this).text();
            // clog($(this).attr('selected'));
            if (typeof($(this).attr('selected')) != 'undefined') {
                isSel = true;
                return false;
            } else {
                isSel = false;
            }
        });
        // clog(isSel);
        if (!isSel) {
            $("#primary_auditor_select").val(0).change();
        }
    });
};

const saveAssignedCompanies = () => {
    const
        $assign_auditor_select = $("#assign_auditor_select"),
        $com_sel_to_assign = $("#com_sel_to_assign"),
        $assigned_result = $(".assigned_result"),
        $is_update = $("#is_update"),
        loader = $("#AssignedComLoader");
    var
        assign_auditor_select = $assign_auditor_select.children("option:selected").val(),
        com_sel_to_assign = $("select[name='com_sel_to_assign[]']").val();

    $com_sel_to_assign.removeClass("error_input");

    if (isInvalidValue(com_sel_to_assign)) {
        pointInvalid($com_sel_to_assign);
        toastAlert("Please select some companies to assign !", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "ASSIGN_COMPANIES",
        aud: assign_auditor_select,
        coms: com_sel_to_assign,
        update: $is_update.val()
    };
    ajaxRequest(data, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        getAssignedCompanyDetails();
        return false;
    });
};

// const updateAssignedCompanies = () => {
//     const
//         $assign_auditor_select = $("#assign_auditor_select"),
//         $assignCompaniesBtn = $("#assignCompaniesBtn"),
//         $is_update = $("#is_update"),
//         loader = $("#AssignedComLoader");
//     $is_update.val(1);
//     loader.showLoader();
//     assignCompanySection();
//     $assignCompaniesBtn.text("Update");
// };
const updateAssignedCompanies = () => {
    assignCompanySection();
    const
        $assign_auditor_select = $("#assign_auditor_select"),
        $assign_auditors_btn = $("#assign_auditors_btn"),
        $is_update = $("#is_update"),
        loader = $("#AssignedComLoader");
    $is_update.val(1);
    // loader.showLoader();
    $assign_auditors_btn.text("Update");
};

const getLastDateReply = () => {
    const
        $days_to_reply = $("#days_to_reply"),
        $date_of_issue = $("#date_of_issue"),
        $end_date_of_reply = $("#end_date_of_reply");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $("#end_date_of_reply").val("");
        return false;
    }
    if (days_to_reply == "") {
        $("#end_date_of_reply").val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $("#end_date_of_reply").val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
const getQeditLastDateReply = () => {
    const
        $days_to_reply = $("#edit_days_to_reply"),
        $date_of_issue = $("#edit_date_of_issue"),
        $end_date_of_reply = $("#edit_end_date_of_reply");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
function getLastDateReplyMemo(){
    const
        $days_to_reply = $("#days_to_reply_memo"),
        $date_of_issue = $("#date_of_issue_memo"),
        $end_date_of_reply = $("#end_date_of_reply_memo");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $("#end_date_of_reply_memo").val("");
        return false;
    }
    if (days_to_reply == "") {
        $("#end_date_of_reply_memo").val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $("#end_date_of_reply_memo").val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
function getLastDateReplyEditMemo(){
    const
        $days_to_reply = $("#edit_days_to_reply_memo"),
        $date_of_issue = $("#edit_date_of_issue_memo"),
        $end_date_of_reply = $("#edit_end_date_of_reply_memo");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
const getLastDateNoticeReply = () => {
    const
        $days_to_reply = $("#notice_reply_days"),
        $date_of_issue = $("#notice_date"),
        $end_date_of_reply = $("#notice_reply_date");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
const getLastDateEditNoticeReply = () => {
    const
        $days_to_reply = $("#edit_notice_reply_days"),
        $date_of_issue = $("#edit_notice_date"),
        $end_date_of_reply = $("#edit_notice_reply_date");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
const getLastDateQueryExt = () => {
    const
        $days_to_reply = $("#extension_days"),
        $date_of_issue = $("#extension_start_date"),
        $end_date_of_reply = $("#extension_end_date");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};
const getLastDateEditQueryExt = () => {
    const
        $days_to_reply = $("#edit_extension_days"),
        $date_of_issue = $("#edit_extension_start_date"),
        $end_date_of_reply = $("#edit_extension_end_date");

    var
        days_to_reply = $days_to_reply.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        curr_formatted_date = new Date().toISOString().slice(0, 10);
    // alert("No. of Days: " + numb);
    if (isInvalidValue(date_of_issue)) {
        $end_date_of_reply.val("");
        return false;
    }
    if (days_to_reply == "") {
        $end_date_of_reply.val("");
        return false;
    }
    if (isNaN(days_to_reply)) {
        $end_date_of_reply.val("");
        return false;
    }
    var
        daysToAdd = parseInt(days_to_reply, 10);

    // Get today's date
    var currentDate = new Date(date_of_issue);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (daysToAdd - 1));

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);

    $end_date_of_reply.val(formattedDate);
    return false;
};

const AddReply = (qid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");

    loader.showLoader();
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    $modal_body.html('');
    ajaxRequest({ ajax_action: 'GET_REPLY_MODAL', qid }, (res) => {
        $commonModalLabel.html("Add Query Reply with all Details");
        $modal_body.html(res.htm);
        loader.hide();
    });

};

const SaveReply = (qid) => {
    const
        $no_of_query_solved = $("#no_of_query_solved"),
        $query_date_of_reply = $("#query_date_of_reply"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        no_of_query_solved = $no_of_query_solved.val(),
        query_date_of_reply = $query_date_of_reply.val();

    $no_of_query_solved.removeClass('error_input');
    $query_date_of_reply.removeClass('error_input');

    if (isInvalidValue(no_of_query_solved)) {
        pointInvalid($no_of_query_solved);
        toastAlert("Please enter No. query", "error");
        return false;
    }
    if (isInvalidValue(query_date_of_reply)) {
        pointInvalid($query_date_of_reply);
        toastAlert("Please select the date of reply", "error");
        return false;
    }

    const data = {
        ajax_action: "SAVE_QUERY_REPLY",
        qid,
        noqs: no_of_query_solved,
        dor: query_date_of_reply
    };
    loader.showLoader();
    ajaxRequest(data, (res) => {
        let err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        viewQueryNav();
        getAllSectionStats();
        return false;
    });
};

const assignAuditors = () => {
    const
        $company_id = $("#assign_auditor_select"),
        $primary_auditor_select = $("#primary_auditor_select"),
        $is_update = $("#is_update"),
        $secondary_auditor_select = $("select[name='secondary_auditor_select[]']"),
        loader = $("#AssignedComLoader");
    var
        company_id = $company_id.children("option:selected").val(),
        primary_auditor_select = $primary_auditor_select.children("option:selected").val(),
        secondary_auditor_select = $secondary_auditor_select.val();

    if (isInvalidValue(primary_auditor_select, true)) {
        pointInvalid($primary_auditor_select);
        toastAlert("Primary auditor cannot be left blank", "error");
        return false;
    }
    // if (secondary_auditor_select == "") {
    //     pointInvalid($secondary_auditor_select);
    //     toastAlert("Secondary auditor cannot be left blank", "error");
    //     return false;
    // }
    loader.showLoader();
    const data = {
        ajax_action: "ASSIGN_AUDITORS",
        pid: primary_auditor_select,
        sid: secondary_auditor_select,
        cid: company_id,
        is_update: $is_update.val()
    };
    ajaxRequest(data, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        let sti = setInterval(() => {
            loader.hide();
            getAssignedCompanyDetails();
            clearInterval(sti);
            location.reload();
            return false;
        }, 1000);
        return false;
    });
};

const SendMemo = (cid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var str = `
    <div class="row">
        <div class="col-md-12 col-lg-12 col-sm-12">

            <div class="loader-overlay" id="memoLoader" style="display: none;">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>


            <fieldset class="fldset mt-3">
                <legend>Memo Details</legend>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-outline">
                            <label class="form_label" for="memo_no">Memo No.</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                            <input type="text" id="memo_no" class="form-control" />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-outline">
                            <label class="form_label" for="memo_total_no_of_query">Total No. of Query</label>
                            <input type="text" id="memo_total_no_of_query" class="form-control" />
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="date_of_issue_memo">Date of Issue</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="date" id="date_of_issue_memo" class="form-control" value="${getToday()}" readonly disabled onchange="getLastDateReplyMemo();"/>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="days_to_reply_memo">Days to Reply</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="number" class="form-control" id="days_to_reply_memo" onkeyup="getLastDateReplyMemo();"/>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="end_date_of_reply_memo">Last date of Reply</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="date" class="form-control" id="end_date_of_reply_memo" readonly disabled/>
                      </div>
                    </div>
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-12 col-lg-12 col-sm-12 text-right">
                      <button class="btn btn-sm btn-success" id="save_memo_btn" onclick="saveMemo(${cid});">Add</button>
                    </div>
                  </div>
            </fieldset>
        </div>
    </div>
    `;
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    $modal_body.html(str);
    $commonModalLabel.html("Send Memos From Here");
    loader.hide();
};
const saveMemo = (cid) => {
    const
        $memo_no = $("#memo_no"),
        $memo_total_no_of_query = $("#memo_total_no_of_query"),
        $date_of_issue_memo = $("#date_of_issue_memo"),
        $days_to_reply_memo = $("#days_to_reply_memo"),
        $end_date_of_reply_memo = $("#end_date_of_reply_memo"),
        loader = $("#memoLoader");
    var
        memo_no = $memo_no.val(),
        memo_total_no_of_query = $memo_total_no_of_query.val(),
        date_of_issue_memo = $date_of_issue_memo.val(),
        days_to_reply_memo = $days_to_reply_memo.val(),
        end_date_of_reply_memo = $end_date_of_reply_memo.val();
    if (isInvalidValue(memo_no)) {
        toastAlert("Memo No. cannot be left blank", "error");
        pointInvalid($memo_no);
        return false;
    } else {
        $memo_no.removeClass("error_input");
    }
    if (isInvalidValue(memo_total_no_of_query)) {
        toastAlert("Total no. of query cannot be left blank", "error");
        pointInvalid($memo_total_no_of_query);
        return false;
    } else {
        $memo_total_no_of_query.removeClass("error_input");
    }
    if (isInvalidValue(date_of_issue_memo)) {
        toastAlert("Date of Notice Issue cannot be left blank", "error");
        pointInvalid($date_of_issue_memo);
        return false;
    } else {
        $date_of_issue_memo.removeClass("error_input");
    }
    if (isInvalidValue(days_to_reply_memo)) {
        toastAlert("Days to Reply Notice cannot be left blank", "error");
        pointInvalid($days_to_reply_memo);
        return false;
    } else {
        $days_to_reply_memo.removeClass("error_input");
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_MEMO",
        mno: memo_no,
        mtnoq: memo_total_no_of_query,
        doi: date_of_issue_memo,
        dystr: days_to_reply_memo,
        ldor: end_date_of_reply_memo,
        cid: cid
    }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        // window.location.href = window.location.href;
        $("#commonModal").modal('hide');
        // location.reload();
        getAuditorsAuditTable();
        return false;
    });

};
const saveDirectMemo = () => {
    const
        $memo_no = $("#memo_no"),
        $memo_total_no_of_query = $("#memo_total_no_of_query"),
        $memo_company_select = $("#memo_company_select"),
        $date_of_issue_memo = $("#date_of_issue_memo"),
        $days_to_reply_memo = $("#days_to_reply_memo"),
        $end_date_of_reply_memo = $("#end_date_of_reply_memo"),
        loader = $("#memoLoader");
    var
        memo_no = $memo_no.val(),
        memo_total_no_of_query = $memo_total_no_of_query.val(),
        date_of_issue_memo = $date_of_issue_memo.val(),
        days_to_reply_memo = $days_to_reply_memo.val(),
        memo_company_select = $memo_company_select.children('option:selected').val(),
        end_date_of_reply_memo = $end_date_of_reply_memo.val();
    if (isInvalidValue(memo_company_select)) {
        toastAlert("Please select the company", "error");
        pointInvalid($memo_company_select);
        return false;
    } else {
        $memo_company_select.removeClass("error_input");
    }
    if (isInvalidValue(memo_no)) {
        toastAlert("Memo No. cannot be left blank", "error");
        pointInvalid($memo_no);
        return false;
    } else {
        $memo_no.removeClass("error_input");
    }
    if (isInvalidValue(memo_total_no_of_query)) {
        toastAlert("Total no. of query cannot be left blank", "error");
        pointInvalid($memo_total_no_of_query);
        return false;
    } else {
        $memo_total_no_of_query.removeClass("error_input");
    }
    if (isInvalidValue(date_of_issue_memo)) {
        toastAlert("Date of Notice Issue cannot be left blank", "error");
        pointInvalid($date_of_issue_memo);
        return false;
    } else {
        $date_of_issue_memo.removeClass("error_input");
    }
    if (isInvalidValue(days_to_reply_memo)) {
        toastAlert("Days to Reply Notice cannot be left blank", "error");
        pointInvalid($days_to_reply_memo);
        return false;
    } else {
        $days_to_reply_memo.removeClass("error_input");
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_MEMO",
        mno: memo_no,
        mtnoq: memo_total_no_of_query,
        doi: date_of_issue_memo,
        dystr: days_to_reply_memo,
        ldor: end_date_of_reply_memo,
        cid: memo_company_select
    }, (res) => {
        let
            err = res.error,
            msg = res.message;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        $(".memo_nav_btn").children(".btn").click();
        getMemoTable();
        return false;
    });

};

function getAuditorsAuditTable() {
    const
        $audits_table = $("#audits_table"),
        $tbody = $audits_table.find("tbody"),
        loader = $("#audits_table_loader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_AUDITOR_AUDITS_TABLE" }, (res) => {
        if (!res.error) {
            $tbody.html(res.company_row);
            $("." + TOOLTIP_CLASS).tooltip();
            loader.hide();
        }
    });
};
$("#audit-tab").on("click", () => {
    getAuditorsAuditTable();
});
const viewMemoInfo = (cid, $aud = 2) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find(".modal-dialog").addClass("modal-dialog-centered");
    $commonModal.find(".modal-dialog").addClass("modal-lg");
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_AUDITOR_MEMO_INFO", cid, audType: $aud }, (res) => {
        $modal_body.html(res.thtml);
        $commonModalLabel.html("View Memo Information");
        loader.hide();
    });
};
const getQueriesForNotice = () => {
    const
        $notice_section_company_select = $("#notice_section_company_select"),
        $notice_query_select = $("#notice_query_select"),
        $notice_query_select_sec = $(".notice_query_select_sec"),
        list_nav_btn = $("#list_nav_btn").children("button"),
        add_notice_btn = $("#add_notice_btn");

    var
        notice_section_company_select = $notice_section_company_select.children("option:selected").val();

    if (isInvalidValue(notice_section_company_select, true)) {
        return false;
    }
    ajaxRequest({ ajax_action: "GET_QUERIES_FOR_NOTICE", cid: notice_section_company_select }, (res) => {
        $notice_query_select_sec.html(res.queryOptions);
        $('.multiple').select2();
        add_notice_btn.attr('disabled', false);
        // list_nav_btn.attr('disabled', false);
        add_notice_btn.css('cursor', 'pointer');
        // list_nav_btn.css('cursor', 'pointer');
    });
};
$("#notice_section_company_select").on("change", () => {
    getQueriesForNotice();
    const
        $notice_section_company_select = $("#notice_section_company_select"),
        $add_notice_sec = $("#add_notice_sec"),
        $view_notice_sec = $("#view_notice_sec"),
        $list_nav_btn = $("#list_nav_btn"),
        $btn = $list_nav_btn.children(".btn");
    var
        notice_section_company_select = $notice_section_company_select.children("option:selected").val();
    btn_name = $btn.attr("name");
    if (btn_name != 'add') {
        $add_notice_sec.show();
        $view_notice_sec.hide();
    }
    if (btn_name != 'list') {
        $add_notice_sec.hide();
        $view_notice_sec.show();
    }
    $list_nav_btn.find(".btn").prop("disabled", false);
    $list_nav_btn.find(".btn").css("cursor", "pointer");
    $list_nav_btn.find(".btn").removeAttr("title");
    $list_nav_btn.find(".btn").removeAttr("data-original-title");
    $list_nav_btn.find(".btn").removeClass(TOOLTIP_CLASS);
    ajaxRequest({ ajax_action: "CHECK_OPEN_QURIES_FOR_NOTICE", cid: notice_section_company_select }, (res) => {
        if (res.error) {
            toastAlert(res.message, 'error');
            $add_notice_sec.hide();
            $view_notice_sec.hide();
            $list_nav_btn.find(".btn").prop("disabled", true);
            $list_nav_btn.find(".btn").css("cursor", "not-allowed");
        }
    });
    getNoticeTable();
    // $("." + TOOLTIP_CLASS).tooltip();
});
$("#position_section_company_select").on("change", () => {
    const
        $position_list_nav = $("#position-list-nav"),
        $btn = $position_list_nav.children(".btn"),
        $info_position_sec = $("#info-position-sec"),
        $view_position_sec = $("#view-position-sec"),
        $add_position_sec = $("#add-position-sec"),
        $query_force_close_sec = $("#query_force_close_sec"),
        $position_section_company_select = $("#position_section_company_select");
    var
        position_section_company_select = $position_section_company_select.children("option:selected").val(),
        btn_name = $btn.attr("name");
    $query_force_close_sec.html('');
    $query_force_close_sec.hide();
    $position_section_company_select.removeClass("error_input");
    if (isInvalidValue(position_section_company_select, true)) {
        pointInvalid($position_section_company_select);
        toastAlert("Company Selection is required", "error");
        return false;
    }
    $position_list_nav.find(".btn").attr("disabled", false);
    $position_list_nav.find(".btn").css("cursor", "pointer");
    $position_list_nav.find(".btn").removeAttr("title");
    $position_list_nav.find(".btn").removeAttr("data-original-title");
    $position_list_nav.find(".btn").removeClass(TOOLTIP_CLASS);
    $info_position_sec.hide();
    if (btn_name != 'add') {
        $add_position_sec.show();
        $view_position_sec.hide();
    }
    if (btn_name != 'list') {
        $add_position_sec.hide();
        $view_position_sec.show();
    }
    $("." + TOOLTIP_CLASS).tooltip();
    if (CURRENT_USER_TYPE == EMPLOYEE) {
        getPositionPaperQueries();
    }
    getPositionTableData();
});
const getPositionPaperQueries = () => {
    const
        $position_section_company_select = $("#position_section_company_select"),
        $position_paper_query_select_sec = $("#position_paper_query_select_sec");
    var
        position_section_company_select = $position_section_company_select.children("option:selected").val();

    ajaxRequest({ ajax_action: "GET_QUERIES_FOR_POSITION_PAPER", cid: position_section_company_select }, (res) => {
        if (!res.error) {
            $position_paper_query_select_sec.html(res.queries);
            $('.multiple').select2();
        }
    });
};
const getQueriesForForceClose = () => {
    const
        $position_section_query_select = $('select[name="position_section_query_select[]"]'),
        $query_force_close_sec = $("#query_force_close_sec"),
        $view_position_sec = $("#view-position-sec"),
        $add_position_sec = $("#add-position-sec"),
        btn = $("#position-list-nav");
    var
        position_section_query_select = $position_section_query_select.val(),
        btn_name = btn.children(".btn").attr("name");
    $query_force_close_sec.hide();
    btn.children(".btn").prop('disabled', false);
    btn.children(".btn").css('cursor', 'pointer');
    // switch (btn_name) {
    //     case "list":
    //         $add_position_sec.hide();
    //         $view_position_sec.show();
    //         break;
    //     case "add":
    //         $add_position_sec.show();
    //         $view_position_sec.hide();
    //         break;
    // }
    if (btn_name != 'add') {
        $add_position_sec.show();
        $view_position_sec.hide();
    }
    if (btn_name != 'list') {
        $add_position_sec.hide();
        $view_position_sec.show();
    }
    // $view_position_sec.show();
    // $add_position_sec.show();
    ajaxRequest({ ajax_action: "CHECK_FORCE_CLOSE_QUERIES_FOR_POSITION", qid: position_section_query_select }, (res) => {
        let
            err = res.error,
            haveDays = res.haveDays,
            count = res.count,
            qhtml = res.qhtml;
        if (count) {
            $query_force_close_sec.html(qhtml);
            // if (haveDays) {
            $view_position_sec.hide();
            $add_position_sec.hide();
            // }
            $query_force_close_sec.addClass("animated");
            $query_force_close_sec.addClass("fadeInDown");
            $query_force_close_sec.show();
            btn.children(".btn").prop('disabled', true);
            btn.children(".btn").css('cursor', 'not-allowed');
        }
    });

};
$("#assessment_section_company_select").on("change", () => {
    const
        $assessment_list_nav = $("#assessment-list-nav"),
        $btn = $assessment_list_nav.children(".btn"),
        $info_assessment_sec = $("#info-assessment-sec"),
        $view_assessment_sec = $("#view-assessment-sec"),
        $add_assessment_sec = $("#add-assessment-sec"),
        $assessment_section_company_select = $("#assessment_section_company_select");
    var
        assessment_section_company_select = $assessment_section_company_select.children("option:selected").val(),
        btn_name = $btn.attr("name");

    $assessment_section_company_select.removeClass("error_input");
    if (isInvalidValue(assessment_section_company_select, true)) {
        pointInvalid($assessment_section_company_select);
        toastAlert("Company Selection is required", "error");
        return false;
    }
    $assessment_list_nav.find(".btn").attr("disabled", false);
    $assessment_list_nav.find(".btn").css("cursor", "pointer");
    $info_assessment_sec.hide();
    if (btn_name != 'add') {
        $add_assessment_sec.show();
        $view_assessment_sec.hide();
    }
    if (btn_name != 'list') {
        $add_assessment_sec.hide();
        $view_assessment_sec.show();
    }
    if (CURRENT_USER_TYPE == EMPLOYEE) {
        getAssessmentQueries();
    }
    getAssessmentTable();
});
const getAssessmentQueries = () => {
    const
        $assessment_section_company_select = $("#assessment_section_company_select"),
        $assessment_query_select_sec = $("#assessment_query_select_sec");
    var
        assessment_section_company_select = $assessment_section_company_select.children("option:selected").val();

    ajaxRequest({ ajax_action: "GET_QUERIES_FOR_ASSESSMENT", cid: assessment_section_company_select }, (res) => {
        if (!res.error) {
            $assessment_query_select_sec.html(res.queries);
        }
    });
};
$("#objection_section_company_select").on("change", () => {
    const
        $objection_list_nav = $("#objection-list-nav"),
        $btn = $objection_list_nav.children(".btn"),
        $info_objection_sec = $("#info-objection-sec"),
        $view_objection_sec = $("#view-objection-sec"),
        $add_objection_sec = $("#add-objection-sec"),
        $objection_section_company_select = $("#objection_section_company_select");
    var
        objection_section_company_select = $objection_section_company_select.children("option:selected").val(),
        btn_name = $btn.attr("name");

    $objection_section_company_select.removeClass("error_input");
    if (isInvalidValue(objection_section_company_select, true)) {
        pointInvalid($objection_section_company_select);
        toastAlert("Company Selection is required", "error");
        return false;
    }
    $objection_list_nav.find(".btn").attr("disabled", false);
    $objection_list_nav.find(".btn").css("cursor", "pointer");
    $info_objection_sec.hide();
    if (btn_name != 'add') {
        $add_objection_sec.show();
        $view_objection_sec.hide();
    }
    if (btn_name != 'list') {
        $add_objection_sec.hide();
        $view_objection_sec.show();
    }
    // getObjectionTable();
});

$("#add_notice_btn").on("click", () => {
    const
        $notice_section_company_select = $("#notice_section_company_select"),
        $notice_query_select = $("#notice_query_select"),
        $notice_no = $("#notice_no"),
        $notice_date = $("#notice_date"),
        $notice_reply_days = $("#notice_reply_days"),
        $notice_reply_date = $("#notice_reply_date"),
        list_nav_btn = $("#list_nav_btn").children("button"),
        $notice_query_select_sec = $("#notice_query_select_sec"),
        add_notice_btn = $("#add_notice_btn"),
        loader = $("#NoticeSecLoader");
    var
        notice_section_company_select = $notice_section_company_select.children("option:selected").val(),
        notice_query_select = $('select[name="notice_query_select[]"]').val(),
        notice_no = $notice_no.val(),
        notice_date = $notice_date.val(),
        notice_reply_days = $notice_reply_days.val(),
        notice_reply_date = $notice_reply_date.val();

    $notice_section_company_select.removeClass("error_input");
    $notice_query_select.removeClass("error_input");
    $notice_no.removeClass("error_input");
    $notice_date.removeClass("error_input");
    $notice_reply_days.removeClass("error_input");
    $notice_reply_date.removeClass("error_input");


    if (isInvalidValue(notice_section_company_select, true)) {
        pointInvalid($notice_section_company_select);
        toastAlert("Please select a company to issue notice", "error");
        return false;
    }
    if (isInvalidValue(notice_query_select)) {
        pointInvalid($notice_query_select);
        toastAlert("Please select atleast one query", "error");
        return false;
    }
    if (isInvalidValue(notice_no)) {
        pointInvalid($notice_no);
        toastAlert("Please enter the notice no.", "error");
        return false;
    }
    if (isInvalidValue(notice_date)) {
        pointInvalid($notice_date);
        toastAlert("Please select the notice issue date", "error");
        return false;
    }
    if (isInvalidValue(notice_reply_days)) {
        pointInvalid($notice_reply_days);
        toastAlert("Please enter the Days to Reply", "error");
        return false;
    } else {
        if (isNaN(notice_reply_days)) {
            pointInvalid($notice_reply_days);
            toastAlert("Please enter valid Days to Reply", "error");
            return false;
        }
    }
    if (isInvalidValue(notice_reply_date)) {
        pointInvalid($notice_reply_date);
        toastAlert("Please enter the Last Date of Reply", "error");
        return false;
    }
    loader.showLoader();
    const
        data = {
            ajax_action: "SAVE_NOTICE",
            cid: notice_section_company_select,
            qry: notice_query_select,
            notno: notice_no,
            notdate: notice_date,
            repdays: notice_reply_days,
            repdate: notice_reply_date
        };
    ajaxRequest(data, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, 'error');
            loader.hide();
            return false;
        }
        toastAlert(msg);
        $notice_query_select.val('');
        $notice_no.val('');
        $notice_date.val(getToday());
        $notice_reply_days.val('');
        $notice_reply_date.val('');
        list_nav_btn.click();
        getNoticeTable();
        getQueriesForNotice();
        getAllSectionStats();
        loader.hide();
        return false;
    });
});

const editNotice=(nid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModalLabel.html('Edit Notice Details');
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({ajax_action:"GET_NOTICE_EDIT_FIELDS",nid},(res)=>{
        loader.hide();
        if (res.error) {
            $commonModal.modal('hide');
            toastAlert(res.message,'error');
            return false;
        }
        $modal_body.html(res.htm);
        $('.multiple').select2();
        $('.'+TOOLTIP_CLASS).tooltip();
        return false;
    });
};
const updateNotice=(nid,cid)=>{
    const
        $notice_no = $("#edit_notice_no"),
        $notice_date = $("#edit_notice_date"),
        $notice_reply_days = $("#edit_notice_reply_days"),
        $notice_reply_date = $("#edit_notice_reply_date"),
        list_nav_btn = $("#list_nav_btn").children("button"),
        $notice_query_select_sec = $("#edit_notice_query_select_sec"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        notice_no = $notice_no.val(),
        notice_date = $notice_date.val(),
        notice_reply_days = $notice_reply_days.val(),
        notice_reply_date = $notice_reply_date.val();

    $notice_no.removeClass("error_input");
    $notice_date.removeClass("error_input");
    $notice_reply_days.removeClass("error_input");
    $notice_reply_date.removeClass("error_input");
    if (isInvalidValue(notice_no)) {
        pointInvalid($notice_no);
        toastAlert("Please enter the notice no.", "error");
        return false;
    }
    if (isInvalidValue(notice_date)) {
        pointInvalid($notice_date);
        toastAlert("Please select the notice issue date", "error");
        return false;
    }
    if (isInvalidValue(notice_reply_days)) {
        pointInvalid($notice_reply_days);
        toastAlert("Please enter the Days to Reply", "error");
        return false;
    } else {
        if (isNaN(notice_reply_days)) {
            pointInvalid($notice_reply_days);
            toastAlert("Please enter valid Days to Reply", "error");
            return false;
        }
    }
    if (isInvalidValue(notice_reply_date)) {
        pointInvalid($notice_reply_date);
        toastAlert("Please enter the Last Date of Reply", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_NOTICE",
        nno:notice_no,
        ndate:notice_date,
        nrdys:notice_reply_days,
        nldor:notice_reply_date,
        nid,cid
    },(res)=>{
        let
            err=res.error,
            msg=res.message;
        loader.hide();
        if (err) {
            toastAlert(msg,"error");
            return false;
        }
        toastAlert(msg);
        $commonModal.modal('hide');
        getNoticeTable();
        getAllSectionStats();
        return false;
    });
}

const getNoticeTable = () => {
    const
        $notice_section_company_select = $("#notice_section_company_select"),
        $notice_query_select_sec = $("#notice_query_select_sec"),
        add_notice_btn = $("#add_notice_btn"),
        notice_table = $(".notice_table"),
        audit_closed_alert = $(".audit_closed_alert"),
        loader = $("#NoticeSecLoader");

    var
        notice_section_company_select = $notice_section_company_select.children("option:selected").val(),
        list_nav_btn = $("#list_nav_btn").find(".btn"),
        btn_name = list_nav_btn.attr("name");

    if (isInvalidValue(notice_section_company_select, true)) {
        return false;
    }
    loader.showLoader();
    list_nav_btn = $("#list_nav_btn").find(".btn");
    list_nav_btn.removeAttr("title");
    list_nav_btn.removeAttr("data-original-title");
    list_nav_btn.removeClass(TOOLTIP_CLASS);
    list_nav_btn.prop("disabled", false);
    list_nav_btn.css("cursor", "pointer");
    audit_closed_alert.hide();
    ajaxRequest({ ajax_action: "GET_NOTICE_TABLE", cid: notice_section_company_select }, (res) => {
        notice_table.find("tbody").html(res.trows);
        if (res.audit_closed) {
            list_nav_btn = $("#list_nav_btn").find(".btn");
            if (btn_name == 'list') {
                list_nav_btn.click();
                list_nav_btn = $("#list_nav_btn").find(".btn");
            }
            audit_closed_alert.show();
            list_nav_btn.prop("disabled", true);
            list_nav_btn.css("cursor", "not-allowed");
            list_nav_btn.attr("title", "Audit Closed ! Cannot issue notice");
            list_nav_btn.attr("data-original-title", "Audit Closed ! Cannot issue notice");
            list_nav_btn.addClass(TOOLTIP_CLASS);
        }
        if (res.company_inactive) {
            list_nav_btn = $("#list_nav_btn").find(".btn");
            if (btn_name == 'list') {
                list_nav_btn.click();
                list_nav_btn = $("#list_nav_btn").find(".btn");
            }
            list_nav_btn.prop("disabled", true);
            list_nav_btn.css("cursor", "not-allowed");
            list_nav_btn.attr("title", "Company is inactive now ! Cannot issue notice");
            list_nav_btn.attr("data-original-title", "Company is inactive now ! Cannot issue notice");
            list_nav_btn.addClass(TOOLTIP_CLASS);
        }
        $("." + TOOLTIP_CLASS).tooltip();
        loader.hide();
    });
};

const fillQueryDataFromMemo = () => {
    const
        $query_section_company_select = $("#query_section_company_select"),
        $query_section_memo_select = $("#query_section_memo_select"),
        $query_no = $("#query_no"),
        $case_code = $("#case_code"),
        $total_no_of_query = $("#total_no_of_query"),
        $date_of_issue = $("#date_of_issue"),
        $end_date_of_reply = $("#end_date_of_reply"),
        $audit_type_id = $("#audit_type_id"), //select box
        $type_of_tax_id = $("#type_of_tax_id"), //select box
        $days_to_reply = $("#days_to_reply"),
        loader = $("#queryLoader");
    var
        query_no = $query_no.val(),
        case_code = $case_code.val(),
        total_no_of_query = $total_no_of_query.val(),
        date_of_issue = $date_of_issue.val(),
        end_date_of_reply = $end_date_of_reply.val(),
        audit_type_id = $audit_type_id.children("option:selected").val(),
        type_of_tax_id = $type_of_tax_id.children("option:selected").val(),
        days_to_reply = $days_to_reply.val(),
        query_section_company_select = $query_section_company_select.children("option:selected").val(),
        query_section_memo_select = $query_section_memo_select.children("option:selected").val();

    if (isInvalidValue(query_section_memo_select, true)) {
        return false;
    }
    ajaxRequest({ ajax_action: "AUDITOR_FILL_INFO_FROM_MEMO", mid: query_section_memo_select }, (res) => {
        // clog("Result: " + res.info.toq);
        $total_no_of_query.val(res.info.toq);
        $date_of_issue.val(res.info.doi);
        $end_date_of_reply.val(res.info.ldtr);
        $days_to_reply.val(res.info.dtr);
    });
};

const AddNoticeReply = (nid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    // $commonModal.find(".modal-dialog").addClass("modal-dialog-centered");
    $commonModal.find(".modal-dialog").addClass("modal-lg");
    $commonModal.modal('show');
    loader.showLoader();
    var html = `
    <fieldset class="fldset">
        ${getSpinner(true,"notice_reply_loader")}
        <legend>Add Reply Date</legend>
        <div class="row">
            <div class="col-md-6">
                <input type="date" class="form-control" id="notice_reply_date_input" />
            </div>
            <div class="col-md-6">
                <button type="button" class="btn btn-sm btn-primary" id="notice_reply_date_save_btn" onclick=saveNoticeReply(${nid});><i class="fas fa-save"></i>&nbsp;Save</button>
            </div>
        </div>
    </fieldset>
    `;
    $modal_body.html(html);
    $commonModalLabel.html("Add Notice Reply");
    loader.hide();
};

const saveNoticeReply = (nid) => {
    const
        $notice_reply_date = $("#notice_reply_date_input"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#notice_reply_loader");
    var
        notice_reply_date = $notice_reply_date.val();
    if (isInvalidValue(notice_reply_date)) {
        pointInvalid($notice_reply_date);
        toastAlert("Reply date cannot be left blank", "error");
        return false;
    } else {
        $notice_reply_date.removeClass("error_input");
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_NOTICE_REPLY", nid, dor: notice_reply_date }, (res) => {
        if (res.error) {
            toastAlert(res.message, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(res.message);
        $commonModal.modal('hide');
        getNoticeTable();
        getAllSectionStats();
        return false;
    });

};

const AddQueryExt = (qid, lrd) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModalLabel.html("Enter Query Extension Details");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    // Get today's date
    var currentDate = new Date(lrd);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate());

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);
    var str = `
        <fieldset class="fldset">
            <legend>Extension Details</legend>
            <div class="row mt-2">
                <div class="col-md-4">
                    <label class="form_label" for="extension_start_date">Extension Start Date</label>${getAsterics()}
                    <input type="date" class="form-control" id="extension_start_date" onchange="getLastDateQueryExt();" value="${formattedDate}" readonly disabled />
                </div>
                <div class="col-md-4">
                    <label class="form_label" for="extension_days">Extension Days</label>${getAsterics()}
                    <input type="text" class="form-control" id="extension_days" onkeyup="getLastDateQueryExt();" />
                </div>
                <div class="col-md-4">
                    <label class="form_label" for="extension_end_date">Extension End Date</label>${getAsterics()}
                    <input type="date" class="form-control" id="extension_end_date" readonly disabled />
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-12 text-right">
                    <button class="btn btn-sm btn-primary" type="button" id="save_query_ext_btn" onclick="saveQueryExt(${qid});">
                        <i class="fas fa-save"></i>&nbsp;Save
                    </button>
                </div>
            </div>
        </fieldset>
    `;
    $modal_body.html(str);
    loader.hide();
    return false;
}

const saveQueryExt = (qid) => {
    const
        $extension_start_date = $("#extension_start_date"),
        $extension_days = $("#extension_days"),
        $extension_end_date = $("#extension_end_date"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");

    var
        extension_start_date = $extension_start_date.val(),
        extension_days = $extension_days.val(),
        extension_end_date = $extension_end_date.val();

    $extension_start_date.removeClass("error_input");
    $extension_days.removeClass("error_input");
    $extension_end_date.removeClass("error_input");

    if (isInvalidValue(extension_start_date)) {
        pointInvalid($extension_start_date);
        toastAlert("Ext. Start date cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(extension_days)) {
        pointInvalid($extension_days);
        toastAlert("Ext. Days cannot be left blank", "error");
        return false;
    } else {
        if (isNaN(extension_days)) {
            pointInvalid($extension_days);
            toastAlert("Please enter a valid number", "error");
            return false;
        }
    }
    if (isInvalidValue(extension_end_date)) {
        pointInvalid($extension_end_date);
        toastAlert("Ext. End date cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "SAVE_EXTENSION_DATE_AUDITOR",
        stdate: extension_start_date,
        enddate: extension_end_date,
        extdays: extension_days,
        qid
    };
    ajaxRequest(data, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        getQueryTableData();
        getAllSectionStats();
        return false;
    });
};

const AddQueryExtApproval = (eid, qid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_QUERY_EXT_REQUESTED_DAYS",
        eid,
        qid
    },(res)=>{
        if (!res.error) {
            var body = `
            <div class="row">
                <div class="col-12 text-center" style="margin-bottom:10px;">Approve or Reject Requested Extension Date</div>
                <div class="col-12 text-left mt-2" style="margin-bottom:10px;">
                    <span><strong>Requested Days: </strong>${res.ext_days}</span>
                    <span><strong>Requested extension till: </strong>${res.ext_end_date}</span>
                    <br>
                    <input type="text" class="form-control" id="query_ext_approved_days" value="${res.ext_days}" placeholder="Enter How many days can be approved..." onkeyup="getNewQueryExtLastDate($(this).val(),${eid}, ${qid});" />
                    <small id="passwordHelpInline" class="text-muted">
                        <i class="text-danger">*</i>&nbsp; Enter How many days can be approved
                    </small>
                    <br />
                    <span id="newQueryExtLastDate"></span>
                </div>
                <div class="col-6 text-right">
                    <button type="button" class="btn btn-sm btn-primary" id="query_ext_approve_confirm" onclick="ApproveQueryExtConfirm(${eid}, '${qid}');"><i class="fas fa-stamp"></i>&nbsp;Approve</button>
                </div>
                <div class="col-6 text-left">
                    <button type="button" class="btn btn-sm btn-danger" id="query_ext_reject_btn" onclick="ApproveQueryExtReject(${eid}, '${qid}');"><i class="fas fa-times"></i>&nbsp;Reject</button>
                </div>
                <div class="col-6 text-left d-none">
                    <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal" aria-label="Close" id="query_ext_approve_cancel"><i class="fas fa-times"></i>&nbsp;Cancel</button>
                </div>
            </div>
            `;
            $modal_body.html(body);
            $commonModalLabel.html("Approval of Query Reply Date Extension");
            $modal_footer.hide();
            loader.hide();
        }
    });
};

const getNewQueryExtLastDate = (days,eid, qid) => {
    const
        $newQueryExtLastDate = $("#newQueryExtLastDate");
    if (isNaN(days)) {
        $newQueryExtLastDate.val('');
        $newQueryExtLastDate.hide();
        return false;
    }
    ajaxRequest({ajax_action:"GET_NEW_QUERY_EXT_LAST_DATE",eid, qid,days},(res)=>{
        $newQueryExtLastDate.html(`<small>New Extension Due date will be: <strong>${res.new_ext_date}</strong></small>`);
        $newQueryExtLastDate.show();
    });
}

function ApproveQueryExtConfirm(eid, qid) {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $query_ext_approved_days = $("#query_ext_approved_days"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        query_ext_approved_days=$query_ext_approved_days.val();
    $query_ext_approved_days.removeClass('error_input');
    if (isInvalidValue(query_ext_approved_days,true)) {
        pointInvalid($query_ext_approved_days);
        toastAlert("Please input valid days count", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "APPROVE_QUERY_EXTENSION", eid, qid, ed:query_ext_approved_days }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        getQueryTableData();
        return false;
    });
};
const ApproveQueryExtReject = (eid, qid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "REJECT_QUERY_EXTENSION", eid, qid }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        getQueryTableData();
        return false;
    });
};
$("#position_paper_add_btn").on("click", () => {
    const
        $position_paper_issue_date = $("#position_paper_issue_date"),
        $position_paper_submit_date = $("#position_paper_submit_date"),
        $position_paper_ref_no = $("#position_paper_ref_no"),
        $position_section_company_select = $("#position_section_company_select"),
        $position_section_query_select = $('select[name="position_section_query_select[]"]'),
        $position_list_nav = $("#position-list-nav"),
        loader = $("#positionPaperLoader");
    var
        position_paper_issue_date = $position_paper_issue_date.val(),
        position_paper_ref_no = $position_paper_ref_no.val(),
        position_paper_submit_date = $position_paper_submit_date.val(),
        position_section_company_select = $position_section_company_select.children("option:selected").val(),
        position_section_query_select = $position_section_query_select.val();
    $position_section_company_select.removeClass("error_input");
    $position_section_query_select.removeClass("error_input");
    $position_paper_issue_date.removeClass("error_input");
    $position_paper_submit_date.removeClass("error_input");
    $position_paper_ref_no.removeClass("error_input");
    if (isInvalidValue(position_section_company_select, true)) {
        pointInvalid($position_section_company_select);
        toastAlert("Please select a company", "error");
        return false;
    }
    if (isInvalidValue(position_section_query_select)) {
        pointInvalid($position_section_query_select);
        toastAlert("Please select a Query", "error");
        return false;
    }
    if (isInvalidValue(position_paper_ref_no)) {
        pointInvalid($position_paper_ref_no);
        toastAlert("Please enter the reference no.", "error");
        return false;
    }
    if (isInvalidValue(position_paper_issue_date)) {
        pointInvalid($position_paper_issue_date);
        toastAlert("Please enter the date of issue", "error");
        return false;
    }
    if (isInvalidValue(position_paper_submit_date)) {
        pointInvalid($position_paper_submit_date);
        toastAlert("Please enter the date of submission", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_POSITION_PAPER_DATA",
        ref: position_paper_ref_no,
        doi: position_paper_issue_date,
        cid: position_section_company_select,
        qid: position_section_query_select,
        psd: position_paper_submit_date
    }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(msg);
        getPositionTableData();
        getPositionPaperQueries();
        getAllSectionStats();
        $position_paper_issue_date.val(getToday());
        $position_paper_submit_date.val('');
        $position_list_nav.children(".btn").click();
        return false;
    });
});

const editPpaper=(pid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find(".modal-dialog").addClass("modal-dialog-centered");
    $commonModal.find(".modal-dialog").addClass("modal-lg");
    $commonModalLabel.html("Edit Position Paper");
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({
        ajax_action:"GET_PPAPER_EDIT_FIELDS",
        pid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            $commonModal.modal('hide');
            return false;
        }
        $modal_body.html(res.htm);
        return false;
    });
};

const updatePpaper=(pid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader"),
        $position_paper_issue_date = $("#edit_position_paper_issue_date"),
        $position_paper_submit_date = $("#edit_position_paper_submit_date"),
        $position_paper_ref_no = $("#edit_position_paper_ref_no"),
        $position_list_nav = $("#position-list-nav");
    var
        position_paper_issue_date = $position_paper_issue_date.val(),
        position_paper_ref_no = $position_paper_ref_no.val(),
        position_paper_submit_date = $position_paper_submit_date.val();
    $position_paper_issue_date.removeClass("error_input");
    $position_paper_submit_date.removeClass("error_input");
    $position_paper_ref_no.removeClass("error_input");
    if (isInvalidValue(position_paper_ref_no)) {
        pointInvalid($position_paper_ref_no);
        toastAlert("Please enter the reference no.", "error");
        return false;
    }
    if (isInvalidValue(position_paper_issue_date)) {
        pointInvalid($position_paper_issue_date);
        toastAlert("Please enter the date of issue", "error");
        return false;
    }
    if (isInvalidValue(position_paper_submit_date)) {
        pointInvalid($position_paper_submit_date);
        toastAlert("Please enter the date of submission", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_POSITION_PAPER",
        ref:position_paper_ref_no,
        doi:position_paper_issue_date,
        dos:position_paper_submit_date,
        pid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            return false;
        }
        toastAlert(res.message);
        $commonModal.modal('hide');
        getPositionTableData();
        getAllSectionStats();
    });
};

const getPositionTableData = () => {
    const
        $view_position_sec = $("#view-position-sec"),
        $position_table = $view_position_sec.find(".position_table"),
        $position_section_company_select = $("#position_section_company_select"),
        $position_paper_query_select_sec = $("#position_paper_query_select_sec"),
        $audit_closed_alert = $(".audit_closed_alert"),
        loader = $("#positionPaperLoader");
    var
        position_section_company_select = $position_section_company_select.children("option:selected").val(),
        $position_list_nav = $("#position-list-nav"),
        $btn = $position_list_nav.children(".btn"),
        btn_name = $btn.attr("name");
    $position_section_company_select.removeClass("error_input");
    if (isInvalidValue(position_section_company_select, true)) {
        pointInvalid($position_section_company_select);
        toastAlert("Please select a company", "error");
        return false;
    }
    loader.showLoader();
    $audit_closed_alert.hide();
    ajaxRequest({ ajax_action: "GET_POSITION_PAPER_TABLE", cid: position_section_company_select }, (res) => {
        let
            err = res.error,
            msg = res.message,
            table = res.table;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        // toastAlert(msg);
        $position_table.find("tbody").html(table);
        if (res.audit_closed) {
            if (btn_name != 'add') {
                $btn.click();
                $btn = $position_list_nav.children(".btn");
            }
            $position_list_nav.find(".btn").attr("disabled", true);
            $position_list_nav.find(".btn").css("cursor", "not-allowed");
            $position_list_nav.find(".btn").attr("title", "Audit has been closed !");
            $position_list_nav.find(".btn").addClass(TOOLTIP_CLASS);
            $audit_closed_alert.show();
            $position_paper_query_select_sec.html('');
        }
        if (res.company_inactive) {
            if (btn_name != 'add') {
                $btn.click();
                $btn = $position_list_nav.children(".btn");
            }
            $position_paper_query_select_sec.html('');
            $position_list_nav.find(".btn").attr("disabled", true);
            $position_list_nav.find(".btn").css("cursor", "not-allowed");
            $position_list_nav.find(".btn").attr("title", "Company is inactive now !");
            $position_list_nav.find(".btn").addClass(TOOLTIP_CLASS);
        }
        $("." + TOOLTIP_CLASS).tooltip();
        loader.hide();
        return false;
    });
};
const editPPExtRequest=(peid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModalLabel.html("Edit Position Paper Extension Request");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({
        ajax_action:"GET_POSITION_PAPER_EXT_EDIT_FIELDS",
        peid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            $commonModal.modal('hide');
            return false;
        }
        $modal_body.html(res.htm);
        return false;
    });
};
const updatePositionPaperExt=(pid)=>{
    const
        $edit_extension_start_date=$("#edit_extension_start_date"),
        $edit_extension_days=$("#edit_extension_days"),
        $edit_extension_end_date=$("#edit_extension_end_date"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        edit_extension_start_date=$edit_extension_start_date.val(),
        edit_extension_days=$edit_extension_days.val(),
        edit_extension_end_date=$edit_extension_end_date.val();
    $edit_extension_start_date.removeClass("error_input");
    $edit_extension_days.removeClass("error_input");
    $edit_extension_end_date.removeClass("error_input");
    if (isInvalidValue(edit_extension_start_date)) {
        pointInvalid($edit_extension_start_date);
        toastAlert("Extension start date cannot be left blank","error");
        return false;
    }
    if (isInvalidValue(edit_extension_days)) {
        pointInvalid($edit_extension_days);
        toastAlert("Extension days cannot be left blank","error");
        return false;
    }
    if (isInvalidValue(edit_extension_end_date)) {
        pointInvalid($edit_extension_end_date);
        toastAlert("Extension end date cannot be left blank","error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_POSITION_PAPER_EXT_REQ",
        stdt:edit_extension_start_date,
        days:edit_extension_days,
        endt:edit_extension_end_date,
        pid
    },(res)=>{
        loader.hide();
        let
            err=res.error,
            msg=res.message;
        if (err) {
            toastAlert(msg,"error");
            return false;
        }
        toastAlert(msg);
        $commonModal.modal('hide');
        getPositionTableData();
        getAllSectionStats();
        return false;
    });
};
const getExtAreaPositionPaper = (pid, lrd) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModalLabel.html("Enter Position Paper Extension Details");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();

    // Get today's date
    var currentDate = new Date(lrd);

    // Calculate the new date
    var newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate());

    // Format the new date to 'yyyy-mm-dd'
    var formattedDate = newDate.toISOString().slice(0, 10);
    var str = `
    <fieldset class="fldset">
        <legend>Extension Details</legend>
        <div class="row mt-2">
            <div class="col-md-4">
                <label class="form_label" for="extension_start_date">Extension Start Date</label>${getAsterics()}
                <input type="date" class="form-control" id="extension_start_date" onchange="getLastDateQueryExt();" value="${formattedDate}" readonly disabled />
            </div>
            <div class="col-md-4">
                <label class="form_label" for="extension_days">Extension Days</label>${getAsterics()}
                <input type="text" class="form-control" id="extension_days" onkeyup="getLastDateQueryExt();" />
            </div>
            <div class="col-md-4">
                <label class="form_label" for="extension_end_date">Extension End Date</label>${getAsterics()}
                <input type="date" class="form-control" id="extension_end_date" readonly disabled />
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-12 text-right">
                <button class="btn btn-sm btn-primary" type="button" id="save_query_ext_btn" onclick="savePositionPaperExt(${pid});">
                    <i class="fas fa-save"></i>&nbsp;Save
                </button>
            </div>
        </div>
    </fieldset>
`;
    $modal_body.html(str);
    loader.hide();
    return false;
};

const savePositionPaperExt = (pid) => {
    const
        $extension_start_date = $("#extension_start_date"),
        $extension_days = $("#extension_days"),
        $extension_end_date = $("#extension_end_date"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");

    var
        extension_start_date = $extension_start_date.val(),
        extension_days = $extension_days.val(),
        extension_end_date = $extension_end_date.val();

    $extension_start_date.removeClass("error_input");
    $extension_days.removeClass("error_input");
    $extension_end_date.removeClass("error_input");

    if (isInvalidValue(extension_start_date)) {
        pointInvalid($extension_start_date);
        toastAlert("Ext. Start date cannot be left blank", "error");
        return false;
    }
    if (isInvalidValue(extension_days)) {
        pointInvalid($extension_days);
        toastAlert("Ext. Days cannot be left blank", "error");
        return false;
    } else {
        if (isNaN(extension_days)) {
            pointInvalid($extension_days);
            toastAlert("Please enter a valid number", "error");
            return false;
        }
    }
    if (isInvalidValue(extension_end_date)) {
        pointInvalid($extension_end_date);
        toastAlert("Ext. End date cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    const data = {
        ajax_action: "SAVE_POSITION_PAPER_EXTENSION_DATE_AUDITOR",
        stdate: extension_start_date,
        enddate: extension_end_date,
        extdays: extension_days,
        pid
    };
    ajaxRequest(data, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        getPositionTableData();
        getAllSectionStats();
        return false;
    });
};
const AddPositionPaperExtApproval = (peid, pid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var body = `
<div class="row">
    <div class="col-12 text-center" style="margin-bottom:10px;"><i>Approve Requested Extension Date?</i></div>
    <div class="col-6 text-right">
        <button type="button" class="btn btn-sm btn-primary" id="position_ext_approve_confirm" onclick="ApprovePositionExtConfirm(${peid}, '${pid}');"><i class="fas fa-stamp"></i>&nbsp;Approve</button>
    </div>
    <div class="col-6 text-left">
        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal" aria-label="Close" id="position_ext_approve_cancel"><i class="fas fa-times"></i>&nbsp;Cancel</button>
    </div>
</div>
`;
    $modal_body.html(body);
    $commonModalLabel.html("Approve Extension ?");
    $modal_footer.hide();
    $commonModal.modal('show');
};

const ApprovePositionExtConfirm = (peid, pid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "APPROVE_POSITION_EXTENSION", peid, pid }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $commonModal.modal('hide');
        getPositionTableData();
        getAllSectionStats();
        return false;
    });
};
const AddPositionPaperReply = (pid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    // $commonModal.find(".modal-dialog").addClass("modal-dialog-centered");
    $commonModal.find(".modal-dialog").addClass("modal-lg");
    $commonModal.modal('show');
    loader.showLoader();
    var html = `
    <fieldset class="fldset">
        ${getSpinner(true,"position_reply_loader")}
        <legend>Add Reply Date</legend>
        <div class="row">
            <div class="col-md-6">
                <input type="date" class="form-control" id="position_reply_date_input" readonly disabled value="${getToday()}" />
            </div>
            <div class="col-md-6">
                <button type="button" class="btn btn-sm btn-primary" id="position_reply_date_save_btn" onclick=savePositionReply(${pid});><i class="fas fa-save"></i>&nbsp;Save</button>
            </div>
        </div>
    </fieldset>
    `;
    $modal_body.html(html);
    $commonModalLabel.html("Add Position Paper Reply");
    loader.hide();
};

const savePositionReply = (pid) => {
    const
        $position_reply_date = $("#position_reply_date_input"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#position_reply_loader");
    var
        position_reply_date = $position_reply_date.val();
    if (isInvalidValue(position_reply_date)) {
        pointInvalid($position_reply_date);
        toastAlert("Reply date cannot be left blank", "error");
        return false;
    } else {
        $position_reply_date.removeClass("error_input");
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_POSITION_PAPER_REPLY", pid, dor: position_reply_date }, (res) => {
        if (res.error) {
            toastAlert(res.message, "error");
            loader.hide();
            return false;
        }
        loader.hide();
        toastAlert(res.message);
        $commonModal.modal('hide');
        getPositionTableData();
        getAllSectionStats();
        return false;
    });

};

$("#assessment_issue_btn").on("click", () => {
    const
        $assessment_ref_no = $("#assessment_ref_no"),
        $assessment_date_of_issue = $("#assessment_date_of_issue"),
        $assessment_section_company_select = $("#assessment_section_company_select"),
        $assessment_section_query_select = $("#assessment_section_query_select"),
        $assessment_claimable_tax_amount = $("#assessment_claimable_tax_amount"),
        $assessment_claimable_penalty_amount = $("#assessment_claimable_penalty_amount"),
        $assessment_omitted_income_amount = $("#assessment_omitted_income_amount"),
        loader = $("#assessmentLoader");
    var
        assessment_section_company_select = $assessment_section_company_select.children("option:selected").val(),
        assessment_section_query_select = $assessment_section_query_select.children("option:selected").val(),
        assessment_ref_no = $assessment_ref_no.val(),
        assessment_claimable_tax_amount = $assessment_claimable_tax_amount.val(),
        assessment_claimable_penalty_amount = $assessment_claimable_penalty_amount.val(),
        assessment_omitted_income_amount = $assessment_omitted_income_amount.val(),
        assessment_date_of_issue = $assessment_date_of_issue.val();
    $assessment_section_company_select.removeClass("error_input");
    $assessment_section_query_select.removeClass("error_input");
    $assessment_ref_no.removeClass("error_input");
    $assessment_claimable_tax_amount.removeClass("error_input");
    $assessment_claimable_penalty_amount.removeClass("error_input");
    $assessment_date_of_issue.removeClass("error_input");
    $assessment_omitted_income_amount.removeClass("error_input");
    if (isInvalidValue(assessment_section_company_select, true)) {
        pointInvalid($assessment_section_company_select);
        toastAlert("Please select a company to proceed", "error");
        return false;
    }
    if (isInvalidValue(assessment_section_query_select, true)) {
        pointInvalid($assessment_section_query_select);
        toastAlert("Please select a position paper to proceed", "error");
        return false;
    }
    if (isInvalidValue(assessment_ref_no)) {
        pointInvalid($assessment_ref_no);
        toastAlert("Assessment Ref. No. is required", "error");
        return false;
    }
    if (isInvalidValue(assessment_claimable_tax_amount, true)) {
        pointInvalid($assessment_claimable_tax_amount);
        toastAlert("Tax claimable amount is required", "error");
        return false;
    } else {
        if (isNaN(assessment_claimable_tax_amount)) {
            pointInvalid($assessment_claimable_tax_amount);
            toastAlert("Please enter a valid amount", "error");
            return false;
        }
    }
    if (isInvalidValue(assessment_claimable_penalty_amount, true)) {
        pointInvalid($assessment_claimable_penalty_amount);
        toastAlert("Penalty amount is required", "error");
        return false;
    } else {
        if (isNaN(assessment_claimable_penalty_amount)) {
            pointInvalid($assessment_claimable_penalty_amount);
            toastAlert("Please enter a valid amount", "error");
            return false;
        }
    }
    if (isInvalidValue(assessment_omitted_income_amount, true)) {
        pointInvalid($assessment_omitted_income_amount);
        toastAlert("Omitted income amount is required", "error");
        return false;
    } else {
        if (isNaN(assessment_omitted_income_amount)) {
            pointInvalid($assessment_omitted_income_amount);
            toastAlert("Please enter a valid amount", "error");
            return false;
        }
    }
    if (isInvalidValue(assessment_date_of_issue)) {
        pointInvalid($assessment_date_of_issue);
        toastAlert("Assessment Date of Issue is required", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_ASSESSMENT_ISSUE",
        cid: assessment_section_company_select,
        qid: assessment_section_query_select,
        ref: assessment_ref_no,
        tca: assessment_claimable_tax_amount,
        pca: assessment_claimable_penalty_amount,
        oi: assessment_omitted_income_amount,
        doi: assessment_date_of_issue
    }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        loader.hide();
        toastAlert(msg);
        $assessment_ref_no.val('');
        $assessment_date_of_issue.val(getToday());
        $("#assessment-list-nav").find('.btn').click();
        getAssessmentTable();
        getAssessmentQueries();
        getAllSectionStats();
        return false;
    });
});

const editAsmt=(aid)=>{
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");

    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $modal_body.html('');
    $commonModalLabel.html("Edit Assessment Paper");
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({
        ajax_action:"GET_ASMT_EDIT_FIELDS",
        aid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            $commonModal.modal('hide');
            return false;
        }
        // toastAlert(res.message);
        $modal_body.html(res.htm);
        return false;
    });
};
const updateAsmt=(aid)=>{
    const
        $edit_assessment_ref_no=$("#edit_assessment_ref_no"),
        $edit_assessment_date_of_issue=$("#edit_assessment_date_of_issue"),
        $edit_assessment_claimable_tax_amount=$("#edit_assessment_claimable_tax_amount"),
        $edit_assessment_claimable_penalty_amount=$("#edit_assessment_claimable_penalty_amount"),
        $edit_assessment_omitted_income_amount=$("#edit_assessment_omitted_income_amount"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        edit_assessment_ref_no=$edit_assessment_ref_no.val(),
        edit_assessment_date_of_issue=$edit_assessment_date_of_issue.val(),
        edit_assessment_claimable_tax_amount=$edit_assessment_claimable_tax_amount.val(),
        edit_assessment_claimable_penalty_amount=$edit_assessment_claimable_penalty_amount.val(),
        edit_assessment_omitted_income_amount=$edit_assessment_omitted_income_amount.val();
    if (isInvalidValue(edit_assessment_ref_no)) {
        pointInvalid($edit_assessment_ref_no);
        toastAlert("Ref No. cannot be left blank !","error");
        return false;
    } else {
        $edit_assessment_ref_no.removeClass("error_input");
    }
    if (isInvalidValue(edit_assessment_date_of_issue)) {
        pointInvalid($edit_assessment_date_of_issue);
        toastAlert("Date of issue cannot be left blank !","error");
        return false;
    } else {
        $edit_assessment_date_of_issue.removeClass("error_input");
    }
    if (isInvalidValue(edit_assessment_claimable_tax_amount,true)) {
        pointInvalid($edit_assessment_claimable_tax_amount);
        toastAlert("Tax amount cannot be left blank !","error");
        return false;
    } else {
        if (isNaN(edit_assessment_claimable_tax_amount)) {            
            pointInvalid($edit_assessment_claimable_tax_amount);
            toastAlert("Please enter a valid amount !","error");
            return false;
        } else {
            $edit_assessment_claimable_tax_amount.removeClass("error_input");
        }
    }
    if (isInvalidValue(edit_assessment_claimable_penalty_amount,true)) {
        pointInvalid($edit_assessment_claimable_penalty_amount);
        toastAlert("Penalty amount cannot be left blank !","error");
        return false;
    } else {
        if (isNaN(edit_assessment_claimable_penalty_amount)) {            
            pointInvalid($edit_assessment_claimable_penalty_amount);
            toastAlert("Please enter a valid amount !","error");
            return false;
        } else {
            $edit_assessment_claimable_penalty_amount.removeClass("error_input");
        }
    }
    if (isInvalidValue(edit_assessment_omitted_income_amount,true)) {
        pointInvalid($edit_assessment_omitted_income_amount);
        toastAlert("Omitted income amount cannot be left blank !","error");
        return false;
    } else {
        if (isNaN(edit_assessment_omitted_income_amount)) {            
            pointInvalid($edit_assessment_omitted_income_amount);
            toastAlert("Please enter a valid amount !","error");
            return false;
        } else {
            $edit_assessment_omitted_income_amount.removeClass("error_input");
        }
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_ASMT_DATA",
        ref:edit_assessment_ref_no,
        doi:edit_assessment_date_of_issue,
        tamt:edit_assessment_claimable_tax_amount,
        pamt:edit_assessment_claimable_penalty_amount,
        oamt:edit_assessment_omitted_income_amount,
        aid
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            return false;
        }
        toastAlert(res.message);
        getAssessmentTable();
        $commonModal.modal('hide');
        // getAllSectionStats();
        return false;
    });
};

const getAssessmentTable = () => {
    const
        $assessment_section_company_select = $("#assessment_section_company_select"),
        $assessment_query_select_sec = $("#assessment_query_select_sec"),
        assessment_table = $(".assessment_table"),
        audit_closed_alert = $(".audit_closed_alert"),
        assessment_list_nav = $("#assessment-list-nav"),
        loader = $("#assessmentLoader");
    var
        assessment_section_company_select = $assessment_section_company_select.children("option:selected").val(),
        btn_name = assessment_list_nav.children('.btn').attr("name");
    $assessment_section_company_select.removeClass("error_input");
    if (isInvalidValue(assessment_section_company_select, true)) {
        pointInvalid($assessment_section_company_select);
        toastAlert("Please select a company to proceed", "error");
        return false;
    }
    loader.showLoader();
    audit_closed_alert.hide();
    assessment_list_nav.children('.btn').prop('disabled', false);
    assessment_list_nav.children('.btn').css('cursor', 'pointer');
    assessment_list_nav.children('.btn').removeClass(TOOLTIP_CLASS);
    assessment_list_nav.children('.btn').removeAttr('title');
    assessment_list_nav.children('.btn').removeAttr('data-original-title');
    ajaxRequest({ ajax_action: "GET_ASSESSMENT_TABLE_DATA", cid: assessment_section_company_select }, (res) => {
        let
            err = res.error,
            msg = res.message,
            table = res.table_tr;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        assessment_table.find("tbody").html(table);
        if (res.audit_closed) {
            audit_closed_alert.show();
            if (btn_name != 'add') {
                assessment_list_nav.children('.btn').click();
            }
            assessment_list_nav.children('.btn').prop('disabled', true);
            assessment_list_nav.children('.btn').css('cursor', 'not-allowed');
            assessment_list_nav.children('.btn').addClass(TOOLTIP_CLASS);
            assessment_list_nav.children('.btn').attr('title', 'Audit has been closed !');
            $assessment_query_select_sec.html('');
        }
        if (res.company_inactive) {
            if (btn_name != 'add') {
                assessment_list_nav.children('.btn').click();
            }
            assessment_list_nav.children('.btn').prop('disabled', true);
            assessment_list_nav.children('.btn').css('cursor', 'not-allowed');
            assessment_list_nav.children('.btn').addClass(TOOLTIP_CLASS);
            assessment_list_nav.children('.btn').attr('title', 'Company is inactive now !');
            $assessment_query_select_sec.html('');
        }
        $("." + TOOLTIP_CLASS).tooltip();
        loader.hide();
        return false;
    });
};
const makeAssessmentActive = (aid) => {
    const
        assessment_active = $("#assessment_active_" + aid);
    var active = 0;
    if (assessment_active.prop("checked")) {
        active = 1;
    } else {
        active = 0;
    }
    ajaxRequest({ ajax_action: "MAKE_ASSESSMENT_OPEN_CLOSE", aid, act: active }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
        } else {
            toastAlert(msg)
        }
        getAssessmentTable();
        getAllSectionStats();
        return false;
    });
};
const makeCompanyActive = (cid) => {
    const
        company_active_ = $("#company_active_" + cid);
    var active = 0;
    if (company_active_.prop("checked")) {
        active = 1;
    }
    // clog("Active: " + company_active_.prop("checked"));
    // clog("Switch: " + company_active_);
    // clog("active status: " + active);
    // return false;
    ajaxRequest({ ajax_action: "MAKE_COMPANY_ACTIVE_INACTIVE", cid, act: active }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            if (company_active_.prop("checked")) {
                company_active_.prop("checked", false);
            } else {
                company_active_.prop("checked", true);
            }
        } else {
            toastAlert(msg);
        }
        return false;
    });
};
const changeAssessmentStatus = (aid) => {
    const
        assessment_active = $("#assessment_active_" + aid);
    var
        active = assessment_active.children("option:selected").val();
    assessment_active.removeClass("error_input");
    if (isInvalidValue(active, true)) {
        pointInvalid(assessment_active);
        toastAlert("Please select a valid status", "error");
        return false;
    }
    ajaxRequest({ ajax_action: "MAKE_ASSESSMENT_OPEN_CLOSE", aid, act: active }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
        } else {
            toastAlert(msg)
        }
        getAssessmentTable();
        getAllSectionStats();
        return false;
    });
};

const getForceCloseQuery = (qid) => {
    const
        $position_reply_date = $("#position_reply_date_input"),
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var html = `
    <fieldset class="fldset">
        <legend>Confirm Force Close?</legend>
        <div class="row">
            <div class="col-md-6">
                <input type="text" class="form-control" id="query_force_close_remarks" placeholder="Write a Remarks..." />
            </div>
            <div class="col-md-6">
                <button type="button" class="btn btn-sm btn-danger" id="query_force_close_input_btn" onclick=saveQueryForceClose(${qid});><i class="fas fa-times"></i>&nbsp;Close Query</button>
            </div>
        </div>
    </fieldset>
    `;
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    $modal_body.html(html);
    $commonModalLabel.html("Query force close reason");
    loader.hide();
};
const saveQueryForceClose = (qid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        $query_force_close_remarks = $("#query_force_close_remarks"),
        loader = $("#commonModalLoader");
    var
        query_force_close_remarks = $query_force_close_remarks.val();
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_QUERY_FORCE_CLOSE", rmks: query_force_close_remarks, qid }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            toastAlert(msg, "error");
            loader.hide();
            return false;
        }
        $commonModal.modal('hide');
        toastAlert(msg);
        getQueriesForForceClose();
        getPositionTableData();
        getAllSectionStats();
        loader.hide();
        return false;
    });
};

const viewQueryReplyDates = (qid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModalLabel.html("Query Reply History");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_ALL_REPLY_DATES_QUERY", qid }, (res) => {
        $modal_body.html(res.html);
        loader.hide();
        return false;
    });
}
const getQueriesForForceCloseAssessment = () => {
    const
        $assessment_list_nav = $("#assessment-list-nav");
    var
        btn = $assessment_list_nav.find('.btn');
    if (!btn.prop('disabled')) {
        if (btn.attr('name') == 'add') {
            btn.click();
        }
    }
};
const AddTaxPayment = (aid, cid, amt) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    var html = `
    <fieldset class="fldset">
        <legend>Tax Collection Amount</legend>
        <div class="row">
            <div class="col-md-6">
                <label class="form_label" for="tax_collection_amount">Enter Amount</label>${getAsterics()}
                <input type="text" class="form-control" id="tax_collection_amount" value="${amt}" placeholder="Enter Amount..." />
            </div>
            <div class="col-md-6">
                <label class="form_label" for="tax_collection_pay_date">Enter Date</label>${getAsterics()}
                <input type="date" class="form-control" id="tax_collection_pay_date" value="${getToday()}" />
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-12 text-right">
                <button type="button" class="btn btn-sm btn-primary" id="tax_collection_pay_input_btn" onclick=saveTaxCollectionPayment(${aid},${cid});><i class="fas fa-save"></i>&nbsp;Save</button>
            </div>
        </div>
    </fieldset>
    `;
    $modal_body.html(html);
    $commonModalLabel.html("Enter Tax Amount Details");
    loader.hide();
};
const saveTaxCollectionPayment = (aid, cid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $tax_collection_amount = $("#tax_collection_amount"),
        $tax_collection_pay_date = $("#tax_collection_pay_date"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $tax_collection_pay_date.removeClass("error_input");
    $tax_collection_amount.removeClass("error_input");
    var
        tax_collection_amount = $tax_collection_amount.val(),
        tax_collection_pay_date = $tax_collection_pay_date.val();
    if (isInvalidValue(tax_collection_amount, true)) {
        pointInvalid($tax_collection_amount);
        toastAlert("Tax amount cannot be left blank", "error");
        return false;
    } else {
        if (isNaN(tax_collection_amount)) {
            pointInvalid($tax_collection_amount);
            toastAlert("Please enter a valid amount", "error");
            return false;
        }
    }
    if (isInvalidValue(tax_collection_pay_date)) {
        pointInvalid($tax_collection_pay_date);
        toastAlert("Payment Date cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_TAX_PAYMENT_DATA", aid, cid, dt: tax_collection_pay_date, amt: tax_collection_amount }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        let sti = setInterval(() => {
            loader.hide();
            $commonModal.modal('hide');
            location.reload();
            clearInterval(sti);
            return false;
        }, 1000);
        return false;
    });
};
const AddPenaltyPayment = (aid, cid, amt) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    var html = `
    <fieldset class="fldset">
        <legend>Tax Penalty Amount</legend>
        <div class="row">
            <div class="col-md-6">
                <label class="form_label" for="penalty_collection_amount">Enter Amount</label>${getAsterics()}
                <input type="text" class="form-control" id="penalty_collection_amount" value="${amt}" placeholder="Enter Amount..." />
            </div>
            <div class="col-md-6">
                <label class="form_label" for="penalty_collection_pay_date">Enter Date</label>${getAsterics()}
                <input type="date" class="form-control" id="penalty_collection_pay_date" value="${getToday()}" />
            </div>
        </div>
        <div class="row mt-2">
            <div class="col-md-12 text-right">
                <button type="button" class="btn btn-sm btn-primary" id="penalty_collection_pay_input_btn" onclick=savePenaltyCollectionPayment(${aid},${cid});><i class="fas fa-save"></i>&nbsp;Save</button>
            </div>
        </div>
    </fieldset>
    `;
    $modal_body.html(html);
    $commonModalLabel.html("Enter Penalty Amount Details");
    loader.hide();
};
const savePenaltyCollectionPayment = (aid, cid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $penalty_collection_amount = $("#penalty_collection_amount"),
        $penalty_collection_pay_date = $("#penalty_collection_pay_date"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    $penalty_collection_pay_date.removeClass("error_input");
    $penalty_collection_amount.removeClass("error_input");
    var
        penalty_collection_amount = $penalty_collection_amount.val(),
        penalty_collection_pay_date = $penalty_collection_pay_date.val();
    if (isInvalidValue(penalty_collection_amount, true)) {
        pointInvalid($penalty_collection_amount);
        toastAlert("Penalty amount cannot be left blank", "error");
        return false;
    } else {
        if (isNaN(penalty_collection_amount)) {
            pointInvalid($penalty_collection_amount);
            toastAlert("Please enter a valid amount", "error");
            return false;
        }
    }
    if (isInvalidValue(penalty_collection_pay_date)) {
        pointInvalid($penalty_collection_pay_date);
        toastAlert("Payment Date cannot be left blank", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_PENALTY_PAYMENT_DATA", aid, cid, dt: penalty_collection_pay_date, amt: penalty_collection_amount }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        let sti = setInterval(() => {
            loader.hide();
            $commonModal.modal('hide');
            location.reload();
            clearInterval(sti);
            return false;
        }, 1000);
        return false;
    });
};
const showPaymentHistory = (act, tid) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var
        label = "",
        type = 0;
    switch (act) {
        case 'tax':
            label = "Tax Payment History";
            type = 1;
            break;
        case 'penalty':
            label = "Penalty Payment History";
            type = 2;
            break;

        default:
            break;
    }
    $commonModalLabel.html(label);
    $commonModal.modal('show');
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_TAX_PAYMENT_HISTORY", tid, type }, (res) => {
        $modal_body.html(res.html);
        loader.hide();
        return false;
    });
};
const editAuditorAssignment = (cid) => {
    const
        $assign_auditor_select = $("#assign_auditor_select"),
        $list_nav_btn = $("#list_nav_btn");
    $list_nav_btn.find('.btn').click();
    $assign_auditor_select.val(cid).change();
};
const getAuditAssignmentViewData = () => {
    const
        table = $(".assigned_audit_table"),
        tbody = table.find("tbody"),
        loader = $("#auditAssignmentLoader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_AUDIT_ASSIGNMENT_VIEW_DATA" }, (res) => {
        tbody.html(res.table);
        $('.' + TOOLTIP_CLASS).tooltip();
        loader.hide();
    });
};
const updateDepartment = (did, dname) => {
    const
        $department_name = $("#department_name"),
        $action_btn = $(".action_btn"),
        $department_update_id = $("#department_update_id"),
        $department_ = $("#department_" + did),
        $department_submit = $action_btn.find("#department_submit"),
        $update_department_btn = $action_btn.find("#update_department_btn"),
        $cancel_department_btn = $action_btn.find("#cancel_department_btn"),
        loader = $("#deptLoader");
    loader.showLoader();
    $(".department_row").removeClass("bg-warning");
    $department_.addClass("bg-warning");
    $department_name.val(dname);
    $department_update_id.val(did);
    $department_submit.hide();
    $update_department_btn.show();
    $cancel_department_btn.show();
    loader.hide();
};
const updateTaxType = (tax_id, tax_name) => {
    const
        $tax_type_name = $("#tax_type_name"),
        $action_btn = $(".action_btn"),
        $tax_type_update_id = $("#tax_type_update_id"),
        $tax_type_ = $("#tax_type_" + tax_id),
        $save_tax_type_btn = $action_btn.find("#save_tax_type_btn"),
        $update_tax_type_btn = $action_btn.find("#update_tax_type_btn"),
        $cancel_tax_type_btn = $action_btn.find("#cancel_tax_type_btn"),
        loader = $("#taxTypeLoader");
    loader.showLoader();
    $(".tax_type_row").removeClass("bg-warning");
    $tax_type_.addClass("bg-warning");
    $tax_type_name.val(tax_name);
    $tax_type_update_id.val(tax_id);
    $save_tax_type_btn.hide();
    $update_tax_type_btn.show();
    $cancel_tax_type_btn.show();
    loader.hide();
};
const updateAuditType = (audit_type_id, audit_type_name) => {
    const
        $audit_type_name = $("#audit_type_name"),
        $action_btn = $(".action_btn"),
        $audit_type_update_id = $("#audit_type_update_id"),
        $audit_type_ = $("#audit_type_" + audit_type_id),
        $save_audit_type_btn = $action_btn.find("#save_audit_type_btn"),
        $update_audit_type_btn = $action_btn.find("#update_audit_type_btn"),
        $cancel_audit_type_btn = $action_btn.find("#cancel_audit_type_btn"),
        loader = $("#auditTypeLoader");
    loader.showLoader();
    $(".audit_type_row").removeClass("bg-warning");
    $audit_type_.addClass("bg-warning");
    $audit_type_name.val(audit_type_name);
    $audit_type_update_id.val(audit_type_id);
    $save_audit_type_btn.hide();
    $update_audit_type_btn.show();
    $cancel_audit_type_btn.show();
    loader.hide();
};
const updateIndustry = (industry_type_id, com_industry_name) => {
    const
        $com_industry_name = $("#com_industry_name"),
        $action_btn = $(".action_btn"),
        $com_industry_update_id = $("#com_industry_update_id"),
        $company_industry_ = $("#company_industry_" + industry_type_id),
        $save_com_industry_btn = $action_btn.find("#save_com_industry_btn"),
        $update_com_industry_btn = $action_btn.find("#update_com_industry_btn"),
        $cancel_com_industry_btn = $action_btn.find("#cancel_com_industry_btn"),
        loader = $("#com_industry_loader");
    loader.showLoader();
    $(".company_industry_row").removeClass("bg-warning");
    $company_industry_.addClass("bg-warning");
    $com_industry_name.val(com_industry_name);
    $com_industry_update_id.val(industry_type_id);
    $save_com_industry_btn.hide();
    $update_com_industry_btn.show();
    $cancel_com_industry_btn.show();
    loader.hide();
};
const updateDesignation = (des_id, desig_name) => {
    const
        $desig_name = $("#desig_name"),
        $action_btn = $(".action_btn"),
        $designation_update_id = $("#designation_update_id"),
        $designation_ = $("#designation_" + des_id),
        $designation_submit = $action_btn.find("#designation_submit"),
        $update_designation_btn = $action_btn.find("#update_designation_btn"),
        $cancel_designation_btn = $action_btn.find("#cancel_designation_btn"),
        loader = $("#desig_loader");
    loader.showLoader();
    $(".designation_row").removeClass("bg-warning");
    $designation_.addClass("bg-warning");
    $desig_name.val(desig_name);
    $designation_update_id.val(des_id);
    $designation_submit.hide();
    $update_designation_btn.show();
    $cancel_designation_btn.show();
    loader.hide();
};
$("#update_audit_type_btn").on("click", () => {
    const
        $audit_type_name = $("#audit_type_name"),
        $action_btn = $(".action_btn"),
        $audit_type_update_id = $("#audit_type_update_id"),
        $save_audit_type_btn = $action_btn.find("#save_audit_type_btn"),
        $update_audit_type_btn = $action_btn.find("#update_audit_type_btn"),
        $cancel_audit_type_btn = $action_btn.find("#cancel_audit_type_btn"),
        loader = $("#auditTypeLoader");
    var
        audit_type_name = $audit_type_name.val(),
        audit_type_update_id = $audit_type_update_id.val();
    $audit_type_name.removeClass("error_input");
    if (isInvalidValue(audit_type_name)) {
        pointInvalid($audit_type_name);
        toastAlert("Name cannot be left blank!", "error");
        return false;
    }
    if (isInvalidValue(audit_type_update_id, true)) {
        toastAlert("Audit type not found. Please reload & try again", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "UPDATE_AUDIT_TYPE", ttid: audit_type_update_id, nm: audit_type_name }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        location.reload();
        return false;
    });
});
$("#update_com_industry_btn").on("click", () => {
    const
        $com_industry_name = $("#com_industry_name"),
        $action_btn = $(".action_btn"),
        $com_industry_update_id = $("#com_industry_update_id"),
        $save_com_industry_btn = $action_btn.find("#save_com_industry_btn"),
        $update_com_industry_btn = $action_btn.find("#update_com_industry_btn"),
        $cancel_com_industry_btn = $action_btn.find("#cancel_com_industry_btn"),
        loader = $("#com_industry_loader");
    var
        com_industry_name = $com_industry_name.val(),
        com_industry_update_id = $com_industry_update_id.val();
    $com_industry_name.removeClass("error_input");
    if (isInvalidValue(com_industry_name)) {
        pointInvalid($com_industry_name);
        toastAlert("Name cannot be left blank!", "error");
        return false;
    }
    if (isInvalidValue(com_industry_update_id, true)) {
        toastAlert("Industry type not found. Please reload & try again", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "UPDATE_INDUSTRY_TYPE", ttid: com_industry_update_id, nm: com_industry_name }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        location.reload();
        return false;
    });
});
$("#update_tax_type_btn").on("click", () => {
    const
        $tax_type_name = $("#tax_type_name"),
        $action_btn = $(".action_btn"),
        $tax_type_update_id = $("#tax_type_update_id"),
        $save_tax_type_btn = $action_btn.find("#save_tax_type_btn"),
        $update_tax_type_btn = $action_btn.find("#update_tax_type_btn"),
        $cancel_tax_type_btn = $action_btn.find("#cancel_tax_type_btn"),
        loader = $("#taxTypeLoader");
    var
        tax_type_name = $tax_type_name.val(),
        tax_type_update_id = $tax_type_update_id.val();
    $tax_type_name.removeClass("error_input");
    if (isInvalidValue(tax_type_name)) {
        pointInvalid($tax_type_name);
        toastAlert("Name cannot be left blank!", "error");
        return false;
    }
    if (isInvalidValue(tax_type_update_id, true)) {
        toastAlert("Tax type not found. Please reload & try again", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "UPDATE_TAX_TYPE", ttid: tax_type_update_id, nm: tax_type_name }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        location.reload();
        return false;
    });
});
$("#update_department_btn").on("click", () => {
    const
        $department_name = $("#department_name"),
        $action_btn = $(".action_btn"),
        $department_update_id = $("#department_update_id"),
        $department_submit = $action_btn.find("#department_submit"),
        $update_department_btn = $action_btn.find("#update_department_btn"),
        $cancel_department_btn = $action_btn.find("#cancel_department_btn"),
        loader = $("#deptLoader");
    var
        department_name = $department_name.val(),
        department_update_id = $department_update_id.val();
    $department_name.removeClass("error_input");
    if (isInvalidValue(department_name)) {
        pointInvalid($department_name);
        toastAlert("Name cannot be left blank!", "error");
        return false;
    }
    if (isInvalidValue(department_update_id, true)) {
        toastAlert("Department not found. Please reload & try again", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "UPDATE_DEPARTMENT", ttid: department_update_id, nm: department_name }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        location.reload();
        return false;
    });
});
$("#update_designation_btn").on("click", () => {
    const
        $desig_name = $("#desig_name"),
        $action_btn = $(".action_btn"),
        $designation_update_id = $("#designation_update_id"),
        $designation_submit = $action_btn.find("#designation_submit"),
        $update_designation_btn = $action_btn.find("#update_designation_btn"),
        $cancel_designation_btn = $action_btn.find("#cancel_designation_btn"),
        loader = $("#desig_loader");
    var
        desig_name = $desig_name.val(),
        designation_update_id = $designation_update_id.val();
    $desig_name.removeClass("error_input");
    if (isInvalidValue(desig_name)) {
        pointInvalid($desig_name);
        toastAlert("Name cannot be left blank!", "error");
        return false;
    }
    if (isInvalidValue(designation_update_id, true)) {
        toastAlert("Designation not found. Please reload & try again", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "UPDATE_DESIGNATION", ttid: designation_update_id, nm: desig_name }, (res) => {
        if (res.error) {
            loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        loader.hide();
        location.reload();
        return false;
    });
});

const getCompanyDashTaxData = () => {
    const
        $taxtypeWiseComAgingChart = $("#taxtypeWiseComAgingChart"),
        $com_dash_com_select = $("#com_dash_com_select"),
        $com_dash_tax_type_select = $("#com_dash_tax_type_select"),
        $company_status_table = $(".company_status_table"),
        tbody = $company_status_table.find('tbody'),
        loader = $("#company_status_table_section_loader");
    var
        com_dash_com_select = $com_dash_com_select.children("option:selected").val(),
        com_dash_tax_type_select = $com_dash_tax_type_select.children("option:selected").val();
    $com_dash_com_select.removeClass("error_input");
    $com_dash_tax_type_select.removeClass("error_input");
    if (isInvalidValue(com_dash_com_select, true)) {
        // pointInvalid($com_dash_com_select);
        return false;
    }
    if (isInvalidValue(com_dash_tax_type_select, true)) {
        // pointInvalid($com_dash_tax_type_select);
        return false;
    }
    loader.showLoader();
    $taxtypeWiseComAgingChart.html('');
    $("#taxPenaltyStatChart").html('');
    $("#qsolvedUnsolvedComChart").html('');
    $("#noticeIssuedPendingComChart").html('');
    $("#ppIssuedPendingComChart").html('');
    $("#asmtIssuedPendingComChart").html('');
    ajaxRequest({ ajax_action: "GET_COMPANY_DASH_COM_STAND_DATA", cid: com_dash_com_select, ttid: com_dash_tax_type_select }, (res) => {
        // clog(res);
        $("#companyTaxWiseStatsSection").css({display:"flex"});
        tbody.html(res.thtml);
        $("#taxPenaltyStatCard").find('.card-footer').html(`
            <span class="text-success">Tax Ach: </span>${res.taxPercent} %
            &nbsp;&nbsp;
            <span class="text-danger">Penalty Ach: </span>${res.penaltyPercent} %
        `);
        //initializing chart
        var colors = ['#007bff','#28a745','#17a2b8','#ffc107','#dc3545'];
        var options = {
            series: [{
            name: 'Total Number of Months',
            data: res.auditAgingvalue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: colors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.auditAgingLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                        text: 'Aging Periods'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Number of Months'
                }
            }
        };

        var taxtypeWiseComAgingChart = new ApexCharts(document.querySelector("#taxtypeWiseComAgingChart"), options);
        taxtypeWiseComAgingChart.render();
        var taxStatColors = ['#007bff','#28a745','#17a2b8','#007bff'];
        var taxStatOptions = {
            series: [{
            name: 'Total Amount',
            data: res.taxPenaltyStatsValue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: taxStatColors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.taxPenaltyStatsLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                        text: 'Tax & Penalty'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Amount'
                }
            }
        };

        var taxPenaltyStatChart = new ApexCharts(document.querySelector("#taxPenaltyStatChart"), taxStatOptions);
        taxPenaltyStatChart.render();
        var qColors = ['#28a745','#dc3545'];
        var qsolUnsolStatOptions = {
            series: [{
            name: 'Total Number of Queries',
            data: res.queryStatValue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: qColors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.queryStatLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                        text: 'Query Solved & Unsolved'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Number of Queries'
                }
            }
        };

        var qsolvedUnsolvedComChart = new ApexCharts(document.querySelector("#qsolvedUnsolvedComChart"), qsolUnsolStatOptions);
        qsolvedUnsolvedComChart.render();
        var notColors = ['#007bff','#dc3545'];
        var noticeDataOptions = {
            series: [{
            name: 'Total Number of Notice',
            data: res.noticeStatValue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: notColors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.noticeStatLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                        text: 'Notice Issued & Pending'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Number of Notice'
                }
            }
        };

        var noticeIssuedPendingComChart = new ApexCharts(document.querySelector("#noticeIssuedPendingComChart"), noticeDataOptions);
        noticeIssuedPendingComChart.render();
        var ppOptions = {
            series: [{
            name: 'Total Number of Position paper',
            data: res.positionStatValue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: notColors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.positionStatLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                        text: 'Position paper Issued & Pending'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Number of Position paper'
                }
            }
        };

        var ppIssuedPendingComChart = new ApexCharts(document.querySelector("#ppIssuedPendingComChart"), ppOptions);
        ppIssuedPendingComChart.render();
        var asmtOptions = {
            series: [{
            name: 'Total Number of Assessment',
            data: res.assessmentStatValue
            }],
            chart: {
                height: 350,
                type: 'bar',
                events: {
                    click: function(chart, w, e) {
                    // console.log(chart, w, e)
                    }
                }
            },
            colors: notColors,
            plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true
            }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories:
                    res.assessmentStatLabel,
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                colors: notColors,
                title: {
                        text: 'Assessment Issued & Pending'
                    }
            },
            yaxis: {
                title: {
                    text: 'Total Number of Assessment'
                }
            }
        };

        var asmtIssuedPendingComChart = new ApexCharts(document.querySelector("#asmtIssuedPendingComChart"), asmtOptions);
        asmtIssuedPendingComChart.render();
        loader.hide();
    });
};

const getAuditDashIndWiseTaxReport = (ind_id, ind_name) => {
    const
        $tax_claimed_per_text = $(".tax_claimed_per_text"),
        $auditDashIndSelectText = $("#auditDashIndSelectText"),
        $tax_claimed_per_progress = $(".tax_claimed_per_progress"),
        $tax_recieved_per_text = $(".tax_recieved_per_text"),
        $tax_recieved_per_progress = $(".tax_recieved_per_progress"),
        $penalty_claimed_per_text = $(".penalty_claimed_per_text"),
        $penalty_claimed_per_progress = $(".penalty_claimed_per_progress"),
        $penalty_recieved_per_text = $(".penalty_recieved_per_text"),
        $penalty_recieved_per_progress = $(".penalty_recieved_per_progress"),
        loader = $("#audDashTaxReportLoader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_AUDIT_DASH_IND_WISE_TAX_REPORT", ind_id }, (res) => {
        $tax_claimed_per_text.parent("h4").children(".tax_report_heading").text(`Tax Claimed: ${res.taxClaimed}`);
        $tax_claimed_per_text.text((res.taxClaimed == '0.00') ? '0%' : '100%');
        $tax_claimed_per_progress.css('width', (res.taxClaimed == '0.00') ? '0%' : '100%');
        $tax_claimed_per_progress.attr('aria-valuenow', (res.taxClaimed == '0.00') ? '0' : '100');

        $tax_recieved_per_text.parent("h4").children(".tax_report_heading").text(`Tax Recieved: ${res.taxRecieved}`);
        $tax_recieved_per_text.text(res.taxRecPer + '%');
        $tax_recieved_per_progress.css('width', res.taxRecPer + '%');
        $tax_recieved_per_progress.attr('aria-valuenow', res.taxRecPer);

        $penalty_claimed_per_text.parent("h4").children(".tax_report_heading").text(`Penalty Claimed: ${res.penaltyClaimed}`);
        $penalty_claimed_per_text.text((res.penaltyClaimed == '0.00') ? '0%' : '100%');
        $penalty_claimed_per_progress.css('width', (res.penaltyClaimed == '0.00') ? '0%' : '100%');
        $penalty_claimed_per_progress.attr('aria-valuenow', (res.penaltyClaimed == '0.00') ? '0' : '100');

        $penalty_recieved_per_text.parent("h4").children(".tax_report_heading").text(`Penalty Recieved: ${res.penaltyRecieved}`);
        $penalty_recieved_per_text.text(res.penaltyRecPer + '%');
        $penalty_recieved_per_progress.css('width', res.penaltyRecPer + '%');
        $penalty_recieved_per_progress.attr('aria-valuenow', res.penaltyRecPer);
        $auditDashIndSelectText.text(ind_name);
        loader.hide();
    });
};

$(".auditorDashAudIndSelect").on('change', () => {
    const
        $auditorDashIndSelect = $("#auditorDashIndSelect"),
        $auditorDashAuditorSelect = $("#auditorDashAuditorSelect"),
        $auditorDashQueryTable = $("#auditorDashQueryTable"),
        $auditorDashAuditorTable = $("#auditorDashAuditorTable"),
        $auditStatusLoader = $("#auditStatusLoader"),
        $queryStatusLoader = $("#queryStatusLoader");
    var
        auditorDashIndSelect = $auditorDashIndSelect.children("option:selected").val(),
        auditorDashAuditorSelect = $auditorDashAuditorSelect.children("option:selected").val(),
        colors = ['#4acb68', '#ffc107'];
    $auditorDashIndSelect.removeClass("error_input");
    $auditorDashAuditorSelect.removeClass("error_input");
    if (isInvalidValue(auditorDashIndSelect, true)) {
        return false;
    }
    if (isInvalidValue(auditorDashAuditorSelect, true)) {
        return false;
    }
    $auditStatusloader.showLoader();
    $queryStatusloader.showLoader();
    $("#NoticeStatusLoader").show();
    ajaxRequest({ ajax_action: "GET_AUDIT_QUERY_STATUS_ON_AUDITOR_DASH", aud: auditorDashAuditorSelect, ind: auditorDashIndSelect }, (res) => {
        $auditorDashQueryTable.find("tbody").html(res.query_thtml);
        $auditorDashAuditorTable.find("tbody").html(res.audit_thtml);
        $("#auditorDashNoticeTable").find("tbody").html(res.notice_thtml);
        var aud_options = {
            series: [{
                name: 'Total Number',
                data: [res.auditCompleted, res.auditPending]
            }],
            chart: {
                height: 350,
                type: 'bar'
            },
            colors: colors,
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: [
                    ['Completed', 'Audits'],
                    ['Pending', 'Audits']
                ],
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                    text: 'Audit Status'
                }
            },
            yaxis: {
                title: {
                    text: 'Total Number'
                }
            }
        };
        var query_options = {
            series: [{
                name: 'Total Number',
                data: [res.qResolved, res.qPending]
            }],
            chart: {
                height: 350,
                type: 'bar'
            },
            colors: colors,
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: [
                    ['Resolved', 'Queries'],
                    ['Pending', 'Queries']
                ],
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                    text: 'Query Status'
                }
            },
            yaxis: {
                title: {
                    text: 'Total Number'
                }
            }
        };
        var notice_options = {
            series: [{
                name: 'Total Number',
                data: [res.notice_issued, res.notice_pending]
            }],
            chart: {
                height: 350,
                type: 'bar'
            },
            colors: colors,
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: [
                    ['Issued', 'Notice'],
                    ['Pending', 'Notice']
                ],
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                    text: 'Notice Status'
                }
            },
            yaxis: {
                title: {
                    text: 'Total Number'
                }
            }
        };
        $("#indwiseAudWiseAuditChart").html("");
        $("#indwiseAudWiseQueryChart").html("");
        $("#indwiseAudWiseNoticeChart").html("");
        var indwiseAudWiseAuditChart = new ApexCharts(document.querySelector("#indwiseAudWiseAuditChart"), aud_options);
        indwiseAudWiseAuditChart.render();
        var indwiseAudWiseQueryChart = new ApexCharts(document.querySelector("#indwiseAudWiseQueryChart"), query_options);
        indwiseAudWiseQueryChart.render();
        var indwiseAudWiseNoticeChart = new ApexCharts(document.querySelector("#indwiseAudWiseNoticeChart"), notice_options);
        indwiseAudWiseNoticeChart.render();
        $auditStatusLoader.hide();
        $queryStatusLoader.hide();
        $("#NoticeStatusLoader").hide();
    });
});

$("#auditorDashAudSelect").on("change", () => {
    const
        $auditorDashAudSelect = $("#auditorDashAudSelect"),
        $AuditorTimeSpentChart = $("#AuditorTimeSpentChart"),
        loader = $("#AuditorTimeSpentLoader");
    var
        colors = ['#007bff', '#28a745', '#ffc107'],
        auditorDashAudSelect = $auditorDashAudSelect.children("option:selected").val();
    if (isInvalidValue(auditorDashAudSelect, true)) {
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_AUDITOR_TIME_SPENT_DATA", aid: auditorDashAudSelect }, (res) => {
        var auditorInfoSec = `
            <span class="text-dark">
                <small class="text-success"><strong>Primary Auditor: </strong>${res.primary_auditor_name}</small>
                </br>
                <small class="text-danger"><strong>Secondary Auditor: </strong>${res.secondary_auditor_name}</small>
            </span>
        `;
        $("#auditorInfoSec").html('');
        $("#auditorInfoSec").hide();
        if ((res.primary_auditor_name != EMPTY_VALUE) || (res.secondary_auditor_name != EMPTY_VALUE)) {
            $("#auditorInfoSec").show();
            $("#auditorInfoSec").html(auditorInfoSec);
        }
        var auditor_time_options = {
            series: [{
                name: 'Total Hour(s)',
                data: [res.primary_auditor_hour, res.secondary_auditor_hour]
            }],
            chart: {
                height: 350,
                type: 'bar'
            },
            colors: colors,
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: [
                    ['Primary', 'Auditor'],
                    ['Secondary', 'Auditor(s)']
                ],
                labels: {
                    style: {
                        colors: colors,
                        fontSize: '12px'
                    }
                },
                title: {
                    text: 'Auditors Name'
                }
            },
            yaxis: {
                title: {
                    text: 'Total Hour(s)'
                }
            }
        };
        $AuditorTimeSpentChart.html('');
        var AuditorTimeSpentChart = new ApexCharts(document.querySelector("#AuditorTimeSpentChart"), auditor_time_options);
        AuditorTimeSpentChart.render();
        loader.hide();
    });
});

const saveTimeReportAuditor = (cid, aud_id) => {
    const
        $audit_time_input = $("#audit_time_input_" + cid),
        loader = $("#time_spent_loader");
    var
        audit_time_input = $audit_time_input.val();
    $audit_time_input.removeClass("error_input");
    if (isInvalidValue(audit_time_input, true)) {
        pointInvalid($audit_time_input);
        toastAlert("Please input a valid Hour(s)", "error");
        return false;
    }
    loader.showLoader();
    ajaxRequest({ ajax_action: "SAVE_AUDITOR_TIME_SPENT", cid, aud_id, th: audit_time_input }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, "error");
            return false;
        }
        toastAlert(msg);
        // loader.hide();
        location.reload();
    });
};

const getCurrentAuditorStat = () => {
    const
        $primary_auditor_select = $("#primary_auditor_select"),
        $CurrentAuditorStatCol = $("#CurrentAuditorStatCol"),
        $CurrAudAuditorDetaildSpan = $CurrentAuditorStatCol.find("#CurrAudAuditorDetaildSpan"),
        $CurrAudPrimAudDetaildSpan = $CurrentAuditorStatCol.find("#CurrAudPrimAudDetaildSpan"),
        $CurrAudSecAudDetaildSpan = $CurrentAuditorStatCol.find("#CurrAudSecAudDetaildSpan"),
        loader = $("#CurrAudStatLoader");
    var
        primary_auditor_select = $primary_auditor_select.children("option:selected").val();
    if (isInvalidValue(primary_auditor_select, true)) {
        return false;
    }
    $CurrentAuditorStatCol.show();
    loader.showLoader();
    ajaxRequest({ ajax_action: "GET_CURRENT_AUDITOR_DETAILS", caudid: primary_auditor_select }, (res) => {
        loader.hide();
        if (res.error) {
            toastAlert(res.message, "error");
            return false;
        }
        $CurrAudAuditorDetaildSpan.html(res.currentAuditorDetails);
        $CurrAudPrimAudDetaildSpan.html(res.primeAuditDetails);
        $CurrAudSecAudDetaildSpan.html(res.secAuditDetails);
    });
};

const getCurrentSecAuditorStat = () => {
    const
        $secondary_auditor_select = $("#secondary_auditor_select"),
        $CurrentAuditorStatCol_sec = $("#CurrentAuditorStatCol_sec"),
        $currentSecondaryAudDataRow = $("#currentSecondaryAudDataRow"),
        $CurrAudAuditorDetaildSpan_sec = $CurrentAuditorStatCol_sec.find("#CurrAudAuditorDetaildSpan_sec"),
        $CurrAudPrimAudDetaildSpan_sec = $CurrentAuditorStatCol_sec.find("#CurrAudPrimAudDetaildSpan_sec"),
        $CurrAudSecAudDetaildSpan_sec = $CurrentAuditorStatCol_sec.find("#CurrAudSecAudDetaildSpan_sec"),
        loader = $("#CurrAudStatLoader_sec");
    var
    // secondary_auditor_select = $secondary_auditor_select.children("option:selected").val();
        secondary_auditor_select = $('#secondary_auditor_select option:selected').toArray().map(item => item.value),
        lastSelected = $('#secondary_auditor_select option:selected').last().text();

    if (isInvalidValue(secondary_auditor_select, true)) {
        return false;
    }
    $CurrentAuditorStatCol_sec.show();
    loader.showLoader();
    clog(secondary_auditor_select);
    clog("Length: " + secondary_auditor_select.length);
    clog("lastSelected: " + lastSelected);

    // Function to get the last item
    function getLastItem(array) {
        return array[array.length - 1];
    }
    // Getting the last item
    clog(getLastItem(secondary_auditor_select));
    var audId = getLastItem(secondary_auditor_select);
    ajaxRequest({ ajax_action: "GET_CURRENT_SECONDARY_AUDITOR_DETAILS", caudid: secondary_auditor_select }, (res) => {
        loader.hide();
        if (res.error) {
            toastAlert(res.message, "error");
            return false;
        }
        $currentSecondaryAudDataRow.html(res.data_row);
    });
};

const approveCloseAudit = (audit_id, reas) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var body = `
    <div class="row">
        <div class="col-12 text-center" style="margin-bottom:10px;"><i>Approve Requested Audit for Close?</i></div>
        <div class="col-12 text-center" style="margin-bottom:10px;"><small><b class="text-danger">Reason: </b><span class="text-secondary">${reas}</span></small></div>
        <div class="col-6 text-right">
            <button type="button" class="btn btn-sm btn-primary" id="audit_close_approve_confirm" onclick="ApproveCloseAudit(${audit_id},1);"><i class="fas fa-stamp"></i>&nbsp;Approve</button>
        </div>
        <div class="col-6 text-left">
            <button type="button" class="btn btn-sm btn-danger" id="audit_close_approve_cancel" onclick="ApproveCloseAudit(${audit_id},2);"><i class="fas fa-times"></i>&nbsp;Reject</button>
        </div>
    </div>
    `;
    $modal_body.html(body);
    $commonModalLabel.html("Approve Audit Close ?");
    $modal_footer.hide();
    $commonModal.modal('show');
};

const ApproveCloseAudit = (audit_id,act) => {
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    loader.showLoader();
    ajaxRequest({ ajax_action: "APPROVE_AUDIT_CLOSE", audid: audit_id, act }, (res) => {
        let
            err = res.error,
            msg = res.message;
        if (err) {
            loader.hide();
            toastAlert(msg, 'error');
            $commonModal.modal('hide');
            return false;
        }
        loader.hide();
        $commonModal.modal('hide');
        toastAlert(msg);
        getAuditorsAuditTable();
    });
};

$(".casesUnderAudCritSelect").on("change", () => {
    const
        $caseUnderAuditAuditorSelect = $("#caseUnderAuditAuditorSelect"),
        $caseUnderAuditMonthSelect = $("#caseUnderAuditMonthSelect"),
        $caseUnderAuditYearSelect = $("#caseUnderAuditYearSelect"),
        $casesUnderAuditViewSection = $("#casesUnderAuditViewSection"),
        $casesUnderAuditTable = $casesUnderAuditViewSection.find("#casesUnderAuditTable"),
        $casesUnderAuditTotal = $casesUnderAuditViewSection.find("#casesUnderAuditTotal"),
        loader = $("#casesUnderAuditLoader");
    var
        caseUnderAuditAuditorSelect = $caseUnderAuditAuditorSelect.children("option:selected").val(),
        caseUnderAuditMonthSelect = $caseUnderAuditMonthSelect.children("option:selected").val(),
        caseUnderAuditYearSelect = $caseUnderAuditYearSelect.children("option:selected").val();
    if (
        (isInvalidValue(caseUnderAuditAuditorSelect, true)) ||
        (isInvalidValue(caseUnderAuditMonthSelect, true)) ||
        (isInvalidValue(caseUnderAuditYearSelect, true))
    ) {
        return false;
    }
    $casesUnderAuditViewSection.show();
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_CASES_UNDER_AUDIT_TABLE_DATA",
        mon: caseUnderAuditMonthSelect,
        yr: caseUnderAuditYearSelect,
        aud: caseUnderAuditAuditorSelect
    }, (res) => {
        loader.hide();
        if (!res.error) {
            $casesUnderAuditTable.find("tbody").html(res.fullHtml);
            $casesUnderAuditTotal.html(res.totalHtml);
            $(".no-print").show();
            // $casesUnderAuditTable.addClass("data-table");
            // $('.data-table').DataTable();
        } else {
            toastAlert(res.message, "error");
            return false;
        }
    });
});
$(".casesCompletedCritSelect").on("change", () => {
    const
        $casesCompletedAuditorSelect = $("#casesCompletedAuditorSelect"),
        $casesCompletedMonthSelect = $("#casesCompletedMonthSelect"),
        $casesCompletedYearSelect = $("#casesCompletedYearSelect"),
        $casesCompletedViewSection = $("#casesCompletedViewSection"),
        $casesCompletedTable = $casesCompletedViewSection.find("#casesCompletedTable"),
        $casesCompletedTotal = $casesCompletedViewSection.find("#casesCompletedTotal"),
        $auditHoursTotal = $casesCompletedViewSection.find("#auditHoursTotal"),
        loader = $("#casesCompletedLoader");
    var
        casesCompletedAuditorSelect = $casesCompletedAuditorSelect.children("option:selected").val(),
        casesCompletedMonthSelect = $casesCompletedMonthSelect.children("option:selected").val(),
        casesCompletedYearSelect = $casesCompletedYearSelect.children("option:selected").val();
    if (
        (isInvalidValue(casesCompletedAuditorSelect, true)) ||
        (isInvalidValue(casesCompletedMonthSelect, true)) ||
        (isInvalidValue(casesCompletedYearSelect, true))
    ) {
        return false;
    }
    $casesCompletedViewSection.show();
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_CASE_COMPLETED_TABLE_DATA",
        mon: casesCompletedMonthSelect,
        yr: casesCompletedYearSelect,
        aud: casesCompletedAuditorSelect
    }, (res) => {
        loader.hide();
        if (!res.error) {
            $casesCompletedTable.find("tbody").html(res.fullHtml);
            $casesCompletedTotal.html(res.totalHtml);
            $auditHoursTotal.html(res.summeryHours);
            $(".no-print").show();
            // $casesCompletedTable.addClass("data-table");
            // $('.data-table').DataTable();
        } else {
            toastAlert(res.message, "error");
            return false;
        }
    });
});
$(".AudDailyReportCritSelect").on("change", () => {
    const
        $AudDailyReportAuditorSelect = $("#AudDailyReportAuditorSelect"),
        $AudDailyReportMonthSelect = $("#AudDailyReportMonthSelect"),
        $AudDailyReportYearSelect = $("#AudDailyReportYearSelect"),
        $AudDailyReportViewSection = $("#AudDailyReportViewSection"),
        $AudDailyReportTable = $AudDailyReportViewSection.find("#AudDailyReportTable"),
        $AudDailyReportTotal = $AudDailyReportViewSection.find("#AudDailyReportTotal"),
        $otherAudDailyReportTable = $AudDailyReportViewSection.find("#otherAudDailyReportTable"),
        // $auditHoursTotal = $AudDailyReportViewSection.find("#auditHoursTotal"),
        loader = $("#AudDailyReportLoader");
    var
        AudDailyReportAuditorSelect = $AudDailyReportAuditorSelect.children("option:selected").val(),
        AudDailyReportMonthSelect = $AudDailyReportMonthSelect.children("option:selected").val(),
        AudDailyReportYearSelect = $AudDailyReportYearSelect.children("option:selected").val();
    if (
        (isInvalidValue(AudDailyReportAuditorSelect, true)) ||
        (isInvalidValue(AudDailyReportMonthSelect, true)) ||
        (isInvalidValue(AudDailyReportYearSelect, true))
    ) {
        return false;
    }
    $AudDailyReportViewSection.show();
    $AudDailyReportTable.show();
    $otherAudDailyReportTable.show();
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_AUDITOR_DAILY_REPORT_DATA",
        mon: AudDailyReportMonthSelect,
        yr: AudDailyReportYearSelect,
        aud: AudDailyReportAuditorSelect
    }, (res) => {
        loader.hide();
        if (!res.error) {
            $AudDailyReportTable.html(res.tableHead);
            $AudDailyReportTable.append(res.fullHtml);
            // $otherAudDailyReportTable.html(res.tableHead);
            // $otherAudDailyReportTable.append(res.otherAuditHtml);
            // $auditHoursTotal.html(res.summeryHours);
            $(".no-print").show();
            // $AudDailyReportTable.addClass("data-table");
            // $('.data-table').DataTable();
        } else {
            toastAlert(res.message, "error");
            return false;
        }
    });
});
$(".AudSelfDailyReportCritSelect").on("change", () => {
    const
        $AudDailyReportMonthSelect = $("#AudDailyReportMonthSelect"),
        $AudDailyReportYearSelect = $("#AudDailyReportYearSelect"),
        $AudDailyReportViewArea = $("#AudDailyReportViewArea"),
        $AudDailyReportTable = $AudDailyReportViewArea.find("#AudSelfDailyReport"),
        loader = $("#AudDailyReportLoader");
    var
        AudDailyReportMonthSelect = $AudDailyReportMonthSelect.children("option:selected").val(),
        AudDailyReportYearSelect = $AudDailyReportYearSelect.children("option:selected").val();
    if (
        (isInvalidValue(AudDailyReportMonthSelect, true)) ||
        (isInvalidValue(AudDailyReportYearSelect, true))
    ) {
        return false;
    }
    // $AudDailyReportViewSection.show();
    // $AudDailyReportTable.show();
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_AUDITOR_SELF_DAILY_REPORT_DATA",
        mon: AudDailyReportMonthSelect,
        yr: AudDailyReportYearSelect
    }, (res) => {
        loader.hide();
        if (!res.error) {
            $AudDailyReportTable.html(res.tableHead);
            $AudDailyReportTable.append(res.fullHtml);
        } else {
            toastAlert(res.message, "error");
            return false;
        }
    });
});

const auditorDateChangeFunc = () => {
    const
        $auditorAttDateSelect = $("#auditorAttDateSelect"),
        $auditorHoursInputDiv = $(".auditorHoursInputDiv"),
        $auditorHoursInputDivInput = $(".auditorHoursInputDiv").find('input[type="number"]'),
        $auditorHoursInputDivSaveBtn = $(".auditorHoursInputDiv").find('span'),
        $auditorOtherActInputArea = $("#auditorOtherActInputArea"),
        $auditorLeaveInput = $auditorOtherActInputArea.find("#auditorLeaveInput"),
        $auditorTrainingInput = $auditorOtherActInputArea.find("#auditorTrainingInput"),
        $auditorOtherDutyInput = $auditorOtherActInputArea.find("#auditorOtherDutyInput"),
        $saveAuditorOtherActBtn = $auditorOtherActInputArea.find("#saveAuditorOtherActBtn"),
        input_loader = $("#time_spent_input_loader"),
        loader = $("#time_spent_loader");

    $auditorHoursInputDivInput.removeClass("error_input");

    $auditorHoursInputDivInput.prop('disabled', true);
    $auditorHoursInputDivSaveBtn.prop('disabled', true);
    $auditorHoursInputDivInput.css('cursor', 'not-allowed');
    $auditorHoursInputDivSaveBtn.css('cursor', 'not-allowed');

    $auditorLeaveInput.prop('disabled', false);
    $auditorTrainingInput.prop('disabled', false);
    $auditorOtherDutyInput.prop('disabled', false);
    $saveAuditorOtherActBtn.prop('disabled', false);

    $auditorLeaveInput.css('cursor', 'pointer');
    $auditorTrainingInput.css('cursor', 'pointer');
    $auditorOtherDutyInput.css('cursor', 'pointer');
    $saveAuditorOtherActBtn.css('cursor', 'pointer');

    $auditorLeaveInput.val('');
    $auditorTrainingInput.val('');
    $auditorOtherDutyInput.val('');
    $auditorHoursInputDivInput.val('');
    var
        auditorAttDateSelect = $auditorAttDateSelect.val();
    loader.showLoader();
    ajaxRequest({
        ajax_action: "GET_AUDITOR_BACK_DATE_ATT_DETAILS",
        dt: auditorAttDateSelect
    }, (res) => {
        let
            err = res.error,
            msg = res.message,
            otherAct = res.otherAct, //Bool
            attRec = res.attRec, //Bool
            otherActArr = res.otherActArr,
            attArr = res.attArr,
            auditClosed = res.auditClosed,
            today = res.today;
        loader.hide();
        if (err) {
            toastAlert(msg, "error");
            return false;
        }
        if (otherAct) {
            $auditorOtherActInputArea.show();

            $.each(otherActArr, function(i, o) {
                $auditorLeaveInput.val(otherActArr.leave_hrs);
                $auditorTrainingInput.val(otherActArr.training_hrs);
                $auditorOtherDutyInput.val(otherActArr.other_duty_hrs);
            });
            $auditorHoursInputDivInput.prop('disabled', true);
            $auditorHoursInputDivSaveBtn.prop('disabled', true);
            $auditorHoursInputDivInput.css('cursor', 'not-allowed');
            $auditorHoursInputDivSaveBtn.css('cursor', 'not-allowed');

            $auditorLeaveInput.prop('disabled', true);
            $auditorTrainingInput.prop('disabled', true);
            $auditorOtherDutyInput.prop('disabled', true);
            $saveAuditorOtherActBtn.prop('disabled', true);

            $auditorLeaveInput.css('cursor', 'not-allowed');
            $auditorTrainingInput.css('cursor', 'not-allowed');
            $auditorOtherDutyInput.css('cursor', 'not-allowed');
            $saveAuditorOtherActBtn.css('cursor', 'not-allowed');

            $auditorHoursInputDivInput.val('');
            toastAlert("Other Activity has already been recorded !", "info");
            return false;
        }
        if (attRec) {
            $auditorOtherActInputArea.hide();

            $auditorLeaveInput.val('');
            $auditorTrainingInput.val('');
            $auditorOtherDutyInput.val('');
            $saveAuditorOtherActBtn.val('');

            $auditorLeaveInput.prop('disabled', true);
            $auditorTrainingInput.prop('disabled', true);
            $auditorOtherDutyInput.prop('disabled', true);
            $saveAuditorOtherActBtn.prop('disabled', true);

            $auditorLeaveInput.css('cursor', 'not-allowed');
            $auditorTrainingInput.css('cursor', 'not-allowed');
            $auditorOtherDutyInput.css('cursor', 'not-allowed');
            $saveAuditorOtherActBtn.css('cursor', 'not-allowed');

            $auditorHoursInputDivInput.prop('disabled', true);
            $auditorHoursInputDivSaveBtn.prop('disabled', true);
            $auditorHoursInputDivInput.css('cursor', 'not-allowed');
            $auditorHoursInputDivSaveBtn.css('cursor', 'not-allowed');

            $.each(attArr, function(i, o) {
                clog("company_list_" + i);
                clog("company_list value: " + attArr.i);
                clog("company_list value: " + o);
                $("#company_list_" + i).find('.audit_btn').find('input[type="number"]').val(o);
            });
            toastAlert("Attendance has already been recorded !", "info");
            return false;
        }
        if ((!attRec) && (today == auditorAttDateSelect)) {
            $auditorOtherActInputArea.hide();
            $auditorHoursInputDivInput.prop('disabled', false);
            $auditorHoursInputDivSaveBtn.prop('disabled', false);
            $auditorHoursInputDivInput.css('cursor', 'pointer');
            $auditorHoursInputDivSaveBtn.css('cursor', 'pointer');
        }
        if ((today != auditorAttDateSelect) && (!otherAct)) {
            $auditorOtherActInputArea.show();

            $auditorLeaveInput.prop('disabled', false);
            $auditorTrainingInput.prop('disabled', false);
            $auditorOtherDutyInput.prop('disabled', false);
            $saveAuditorOtherActBtn.prop('disabled', false);

            $auditorLeaveInput.css('cursor', 'pointer');
            $auditorTrainingInput.css('cursor', 'pointer');
            $auditorOtherDutyInput.css('cursor', 'pointer');
            $saveAuditorOtherActBtn.css('cursor', 'pointer');
            return false;
        }
        clog("auditClosed.length: "+Object.keys(auditClosed).length);
        if (Object.keys(auditClosed).length>0) {
            $.each(auditClosed, function(i, o) {
                clog("Audit Closed Company ID: " + i);
                clog("Audit Closed Value: " + o);
                if (o==2) {
                    $("#company_list_" + i).find('.audit_btn').find('input[type="number"]').prop('disabled', true);
                    $("#company_list_" + i).find('.audit_btn').find('input[type="number"]').css('cursor', 'not-allowed');
                }
            });
        }
    });
};
$("#saveAuditorOtherActBtn").on("click", () => {
    const
        $auditorAttDateSelect = $("#auditorAttDateSelect"),
        $auditorHoursInputDiv = $(".auditorHoursInputDiv"),
        $auditorHoursInputDivInput = $(".auditorHoursInputDiv").find('input[type="number"]'),
        $auditorHoursInputDivSaveBtn = $(".auditorHoursInputDiv").find('span'),
        $auditorOtherActInputArea = $("#auditorOtherActInputArea"),
        $auditorLeaveInput = $auditorOtherActInputArea.find("#auditorLeaveInput"),
        $auditorTrainingInput = $auditorOtherActInputArea.find("#auditorTrainingInput"),
        $auditorOtherDutyInput = $auditorOtherActInputArea.find("#auditorOtherDutyInput"),
        $saveAuditorOtherActBtn = $auditorOtherActInputArea.find("#saveAuditorOtherActBtn"),
        input_loader = $("#time_spent_input_loader"),
        loader = $("#time_spent_loader");

    var
        auditorAttDateSelect = $auditorAttDateSelect.val(),
        auditorLeaveInput = $auditorLeaveInput.val(),
        auditorTrainingInput = $auditorTrainingInput.val(),
        auditorOtherDutyInput = $auditorOtherDutyInput.val();
    $auditorAttDateSelect.removeClass("error_input");
    $auditorLeaveInput.removeClass("error_input");
    if (isInvalidValue(auditorAttDateSelect)) {
        pointInvalid($auditorAttDateSelect);
        toastAlert("Please select the date", "error");
        return false;
    }
    if (
        (isInvalidValue(auditorLeaveInput, true)) &&
        (isInvalidValue(auditorTrainingInput, true)) &&
        (isInvalidValue(auditorOtherDutyInput, true))
    ) {
        pointInvalid($auditorLeaveInput);
        toastAlert("Please enter any of the activities", "error");
        return false;
    }
    input_loader.showLoader();
    ajaxRequest({
        ajax_action: "SAVE_AUDITOR_OTHER_ACTIVITY",
        dt: auditorAttDateSelect,
        li: auditorLeaveInput,
        ti: auditorTrainingInput,
        odi: auditorOtherDutyInput
    }, (res) => {
        if (res.error) {
            input_loader.hide();
            toastAlert(res.message, "error");
            return false;
        }
        toastAlert(res.message);
        setTimeout(() => {
            input_loader.hide();
            location.reload();
            return false;
        }, 1000);
    });
});

$(".collapseCtrlBtn").on("click", () => {
    $(".collapseCtrlBtn").eq(1).html(`<i class="fas fa-sort-up"></i>`);
    if ($("#collapseOne").hasClass('show')) {
        $(".collapseCtrlBtn").eq(1).html(`<i class="fas fa-sort-up"></i>`);
    } else {
        $(".collapseCtrlBtn").eq(1).html(`<i class="fas fa-sort-down"></i>`);
    }
});

$("#memo_company_select").on("change",()=>{
    const
        $memo_nav_btn = $(".memo_nav_btn"),
        $btn = $memo_nav_btn.children(".btn"),
        // $info_assessment_sec = $("#info-assessment-sec"),
        $view_memo_col = $(".view_memo_col"),
        $add_memo_col = $(".add_memo_col"),
        $memo_company_select = $("#memo_company_select");
    var
        memo_company_select = $memo_company_select.children("option:selected").val(),
        btn_name = $btn.attr("name");

    $memo_company_select.removeClass("error_input");
    if (isInvalidValue(memo_company_select, true)) {
        pointInvalid($memo_company_select);
        toastAlert("Company Selection is required", "error");
        return false;
    }
    $memo_nav_btn.find(".btn").attr("disabled", true);
    $memo_nav_btn.find(".btn").css("cursor", "not-allowed");
    // $info_assessment_sec.hide();
    if (btn_name != 'add') {
        $add_memo_col.show();
        $view_memo_col.hide();
    }
    if (btn_name != 'list') {
        $add_memo_col.hide();
        $view_memo_col.show();
    }
    getMemoTable();
});

const getMemoTable=()=>{
    const
        $memo_nav_btn = $(".memo_nav_btn"),
        $memo_table = $("#memo_table"),
        $btn = $memo_nav_btn.children(".btn"),
        $view_memo_col = $(".view_memo_col"),
        $add_memo_col = $(".add_memo_col"),
        $audit_closed_alert = $(".audit_closed_alert"),
        $memo_company_select = $("#memo_company_select"),
        loader = $("#memo_table_loader");
    var
        memo_company_select = $memo_company_select.children("option:selected").val(),
        btn_name = $btn.attr("name");
    loader.showLoader();
    $memo_nav_btn.find(".btn").attr("disabled", true);
    $memo_nav_btn.find(".btn").css("cursor", "not-allowed");
    $audit_closed_alert.hide();
    ajaxRequest({ajax_action:"GET_ALL_MEMO_INFO",cid:memo_company_select},(res)=>{
        if (!res.error) {
            loader.hide();
            $memo_table.find('thead').html(res.thead);
            $memo_table.find('tbody').html(res.table);
            if (!res.isPrimary) {
                $memo_nav_btn.find(".btn").attr("disabled", false);
                $memo_nav_btn.find(".btn").css("cursor", "pointer");
            }
            if (res.auditClosed) {
                $audit_closed_alert.show();
                $memo_nav_btn.find(".btn").attr("disabled", true);
                $memo_nav_btn.find(".btn").css("cursor", "not-allowed");
            } else {
                $audit_closed_alert.hide();
            }
        } else {
            loader.hide();
            toastAlert(res.message, "error");
        }
    });
};

const editMemo = (cid,mdata) => {
    clog(mdata);
    // return false;
    const
        $commonModal = $("#commonModal"),
        $commonModalLabel = $("#commonModalLabel"),
        $modal_body = $commonModal.find(".modal-body"),
        $modal_footer = $commonModal.find(".modal-footer"),
        loader = $("#commonModalLoader");
    var str = `
    <div class="row">
        <div class="col-md-12 col-lg-12 col-sm-12">
            ${getSpinner(true,'memoEditLoader')}
            <fieldset class="fldset mt-3">
                <legend>Memo Details</legend>
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-outline">
                            <label class="form_label" for="edit_memo_no">Memo No.</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                            <input type="text" id="edit_memo_no" class="form-control" value="${mdata.memo_no}" />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-outline">
                            <label class="form_label" for="edit_memo_total_no_of_query">Total No. of Query</label>
                            <input type="text" id="edit_memo_total_no_of_query" class="form-control" value="${mdata.total_no_of_query}" />
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="edit_date_of_issue_memo">Date of Issue</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="date" id="edit_date_of_issue_memo" class="form-control" value="${mdata.date_of_issue}" readonly disabled onchange="getLastDateReplyEditMemo();" />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="edit_days_to_reply_memo">Days to Reply</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="number" class="form-control" id="edit_days_to_reply_memo" onkeyup="getLastDateReplyEditMemo();" value="${mdata.days_to_reply}" />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-outline">
                        <label class="form_label" for="edit_end_date_of_reply_memo">Last date of Reply</label><span class="form_label text-danger" style="padding: 5px;">*</span>
                        <input type="date" class="form-control" id="edit_end_date_of_reply_memo" readonly disabled value="${mdata.last_date_of_reply}" />
                      </div>
                    </div>
                  </div>
                  <div class="row mt-2">
                    <div class="col-md-12 col-lg-12 col-sm-12 text-right">
                      <button class="btn btn-sm btn-success" id="save_memo_btn" onclick="updateMemo(${cid},${mdata.id});"><i class="fas fa-history"></i>&nbsp;Update</button>
                    </div>
                  </div>
            </fieldset>
        </div>
    </div>
    `;
    $commonModal.find('.modal-dialog').addClass('modal-lg');
    $commonModal.modal('show');
    loader.showLoader();
    $modal_body.html(str);
    $commonModalLabel.html("Edit Memos From Here");
    loader.hide();
};

const updateMemo=(cid,mid)=>{
    const
        $commonModal = $("#commonModal"),
        $edit_memo_no=$("#edit_memo_no"),
        $edit_memo_total_no_of_query=$("#edit_memo_total_no_of_query"),
        $edit_date_of_issue_memo=$("#edit_date_of_issue_memo"),
        $edit_days_to_reply_memo=$("#edit_days_to_reply_memo"),
        $edit_end_date_of_reply_memo=$("#edit_end_date_of_reply_memo"),
        loader=$("#memoEditLoader");
    var
        edit_memo_no=$edit_memo_no.val(),
        edit_memo_total_no_of_query=$edit_memo_total_no_of_query.val(),
        edit_date_of_issue_memo=$edit_date_of_issue_memo.val(),
        edit_days_to_reply_memo=$edit_days_to_reply_memo.val(),
        edit_end_date_of_reply_memo=$edit_end_date_of_reply_memo.val();

    $edit_memo_no.removeClass("error_input");
    $edit_memo_total_no_of_query.removeClass("error_input");
    $edit_date_of_issue_memo.removeClass("error_input");
    $edit_days_to_reply_memo.removeClass("error_input");
    $edit_end_date_of_reply_memo.removeClass("error_input");
    if (isInvalidValue(edit_memo_no)) {
        toastAlert("Memo No. cannot be left blank", "error");
        pointInvalid($edit_memo_no);
        return false;
    }
    if (isInvalidValue(edit_memo_total_no_of_query)) {
        toastAlert("Total no. of query cannot be left blank", "error");
        pointInvalid($edit_memo_total_no_of_query);
        return false;
    }
    if (isInvalidValue(edit_date_of_issue_memo)) {
        toastAlert("Date of Notice Issue cannot be left blank", "error");
        pointInvalid($edit_date_of_issue_memo);
        return false;
    }
    if (isInvalidValue(edit_days_to_reply_memo)) {
        toastAlert("Days to Reply Notice cannot be left blank", "error");
        pointInvalid($edit_days_to_reply_memo);
        return false;
    }
    if (isInvalidValue(edit_end_date_of_reply_memo)) {
        toastAlert("Due Date to Reply Notice cannot be left blank", "error");
        pointInvalid($edit_end_date_of_reply_memo);
        return false;
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_MEMO",
        mn:edit_memo_no,
        toq:edit_memo_total_no_of_query,
        doi:edit_date_of_issue_memo,
        dtr:edit_days_to_reply_memo,
        edor:edit_end_date_of_reply_memo,
        cid,mid
    },(res)=>{
        let
            err=res.error,
            msg=res.message;
        loader.hide();
        if (err) {
            toastAlert(msg,"error");
            return false;
        }
        toastAlert(msg);
        $commonModal.modal('hide');
        getMemoTable();
    });
}

function printDivWithHead(csel,divName){
    const
        $cid=$("#"+csel),
        $print_heading=$("#"+divName).find(".print-heading");
    var
        cid=$cid.children('option:selected').val(),
        htm=``;
    if (isInvalidValue(cid,true)) {
        return false;
    }
    ajaxRequest({ajax_action:'GET_PRINT_HEADING',cid},(res)=>{
        if (res.error) {
            toastAlert(res.message,"error");
            return false;
        }
        $print_heading.append(res.ht);
        // clog(document.getElementById(divName).innerHTML);
        // return false;
        printDiv(divName);
        $(".printHeadContent").remove();
        return false;
    });
}

$("#saveQueryAutomationSetting").on("click",()=>{
    const
        $query_automation_active=$("#query_automation_active"),
        $query_automation_suffix=$("#query_automation_suffix"),
        $query_automation_prefix=$("#query_automation_prefix"),
        $query_automation_startNumber=$("#query_automation_startNumber"),
        loader=$("#SettingLoader");
    var
        query_automation_active=($query_automation_active.prop('checked')?1:0),
        query_automation_suffix=$query_automation_suffix.val(),
        query_automation_prefix=$query_automation_prefix.val(),
        query_automation_startNumber=$query_automation_startNumber.val();
    $query_automation_suffix.removeClass("error_input");
    $query_automation_prefix.removeClass("error_input");
    $query_automation_startNumber.removeClass("error_input");
    if (isInvalidValue(query_automation_suffix,true)) {
        pointInvalid($query_automation_suffix);
        toastAlert("Query no. suffix cannot be left blank","error");
        return false;
    }
    if (isInvalidValue(query_automation_prefix,true)) {
        pointInvalid($query_automation_prefix);
        toastAlert("Query no. prefix cannot be left blank","error");
        return false;
    }
    if (isInvalidValue(query_automation_startNumber,true)) {
        pointInvalid($query_automation_startNumber);
        toastAlert("Query no. start digit cannot be left blank","error");
        return false;
    } else {
        if (isNaN(query_automation_startNumber)) {
            pointInvalid($query_automation_startNumber);
            toastAlert("Please enter a valid number","error");
            return false;
        }
    }
    loader.showLoader();
    ajaxRequest({
        ajax_action:"UPDATE_QUERY_NO_AUTOMATION_SETTINGS",
        suf:query_automation_suffix,
        pref:query_automation_prefix,
        stNo:query_automation_startNumber,
        act:query_automation_active
    },(res)=>{
        loader.hide();
        if (res.error) {
            toastAlert(res.message,"error");
            return false;
        }
        $("#lastUpdatedTimeQa").html(res.lastUpdatedTimeQa);
        toastAlert(res.message);
        return false;
    });
})