const isInvalidValue = (value, should_zero_check = false) => {
    let rt = (typeof value === 'undefined' || value === '' || value.length === 0 || value == '-1');
    if (should_zero_check) {
        rt = (value == 0);
    }
    return rt;
};
const isDOMElem = ele => {
    let dom = ele;
    // For handling instance cases that selected using jQuery
    if (ele instanceof jQuery) {
        dom = ele[0];
    }
    try {
        // check with W3 DOM2
        return dom instanceof HTMLElement;
    } catch (e) {
        // For Browsers that do not support W3 DOM2
        return (typeof dom === 'object') && (dom.nodeType === 1) && ('tagName' in dom) &&
            ('style' in dom) && (typeof dom.style === 'object');
    }
};
const pointInvalid = (ele, shouldFocus = true) => {
    if (isDOMElem(ele)) {
        ele.addClass('error_input');
        if (shouldFocus) ele.focus();
    } else {
        throw new Error("HTML Element expected.");
    }
};
const isPhone = (phone_number) => {
    if (typeof phone_number == 'undefined' || phone_number == '') {
        return false;
    }
    // var regex = /^\d{10}$/;
    var regex = /^(\+91[\-\s]?)?[0]?(91[\-\s]?)?[7896]\d{9}$/;
    return regex.test(phone_number);
};
const isEmail = (email) => {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
};
const isJQueryElem = ele => {
    let dom = ele;
    // For handling instance cases that selected using jQuery
    if (ele instanceof jQuery) {
        dom = ele[0];
    } else {
        return false;
    }
    try {
        // check with W3 DOM2
        return dom instanceof HTMLElement;
    } catch (e) {
        // For Browsers that do not support W3 DOM2
        return (typeof dom === 'object') && (dom.nodeType === 1) && ('tagName' in dom) &&
            ('style' in dom) && (typeof dom.style === 'object');
    }
};

const formatToDBDate = (date_str) => {
    if (isInvalidValue(date_str)) {
        return false;
    }
    let s = date_str.split("/");
    return `${s[2]}-${s[1]}-${s[0]}`;
};

/**
 * This function returns the value of the element pass in.
 * If the element passed is not an HTML Element or a jquery element 
 * then undefined returns.
 * @param {any} $ele 
 */
const extractValue = ($ele) => {
    if (isJQueryElem($ele)) {
        $e = $ele[0];
        at = $($e).attr('name');
        if (typeof at === 'undefined') {
            at = '';
        }
        // if($ele.length > 1 || at.includes('[]')) {
        //     let ret1 = $ele.map(function(i ,e){return $(e).val();}).get();
        //     return ret1;
        // }
        let tag = $ele[0].tagName;
        switch (tag.toLowerCase()) {
            case 'select':
                if ($ele.length > 1 || at.includes('[]')) {
                    let ret1 = $ele.map(function(i, e) { return $(e).children('option:selected').val(); }).get();
                    return ret1;
                }
                return $ele.children('option:selected').val();
            case 'input':
                let type = $ele.attr('type');
                if (type == 'radio' || type == 'checkbox') {
                    return $ele.filter(':checked').map((i, e) => $(e).val()).get();
                } else if (type == 'file') {
                    if ($ele.length > 1 || at.includes('[]')) {
                        let ret1 = $ele.map(function(i, e) { return e.files[0]; }).get();
                        return ret1;
                    }
                    return $ele[0].files[0];
                }
                if ($ele.length > 1 || at.includes('[]')) {
                    let ret1 = $ele.map(function(i, e) { return $(e).val(); }).get();
                    return ret1;
                }
                return $ele.val();
            case 'textarea':
                return $ele.val();
            default:
                return undefined;
        }
    } else {
        if ($ele instanceof HTMLCollection) {
            // Collection of items
            let ret = [];
            for ($e of $ele) {
                ret.push(extractValue($e));
            }
            return ret;
        } else if (isDOMElem($ele)) {
            let t = $ele.tagName;
            switch (t.toLowerCase()) {
                case 'select':
                    return $ele.value;
                    break;
                case 'input':
                    let tp = $ele.getAttribute('type');
                    if (tp == 'radio' || tp == 'checkbox') {
                        if ($ele.checked) {
                            return $ele.value;
                        }
                    } else if (tp == 'file') {
                        return $ele.files[0];
                    } else {
                        return $ele.value;
                    }
                    break;
                case 'textarea':
                    return $ele.value;
            }
        } else {
            return undefined;
        }
    }
};

/**
 * This method return the value of form fields
 * the name of the form will become the variable and the 
 * value will be the value
 * use extract-form class as the parent container
 * if you want to get a specif form fileds value
 * otherwise this method returns all the form fileds value from the current page.
 */
function extract(selector = undefined) {
    let pc = null;
    if (typeof selector != 'undefined') {
        pc = document.querySelector(selector);
    }
    if (pc == null || typeof pc === 'undefined' || pc.length == 0) {
        console.log("Pc is not null");
        // Just get all input select textarea variable and value
        let inpts = document.getElementsByTagName('input');
        let select = document.getElementsByTagName('select');
        let textarea = document.getElementsByTagName('textarea');

        if (inpts.length > 0) {
            for (inpt of inpts) {
                attr = inpt.getAttribute('name');
                if (typeof attr === 'undefined' || attr == null) {
                    continue;
                }
                attr = attr.replace("-", "_");
                attr = attr.replace(" ", "_");
                if (!inpt.classList.contains("ignore")) {
                    let tp = inpt.getAttribute('type');
                    if (tp == 'radio' || tp == 'checkbox') {
                        if (inpt.checked) {
                            window[attr] = extractValue(inpt);
                        }
                        // Fix for cases when no checkbox is checked
                        if (isDOMElem(window[attr])) {
                            window[attr] = '0';
                        }
                    } else {
                        // if(attr == 'end_user_add_name') {
                        //     console.log(attr);
                        //     console.log([attr] in window);
                        //     console.log(typeof window[attr]);
                        // }
                        if (document.getElementsByName(attr).length > 1 && [attr] in window && typeof window[attr] != 'object') {
                            let o = window[attr];
                            //console.log(o);
                            if (Array.isArray(o) && !isDOMElem(o)) {
                                o.push(extractValue(inpt));
                                window[attr] = o;
                            } else {
                                window[attr] = [extractValue(inpt)];
                                // console.log(window[attr]);
                                // window[attr].push(o);
                                // window[attr].push(extractValue(inpt));
                            }
                        } else {
                            window[attr] = extractValue(inpt);
                        }
                    }
                }
            }
        }

        for (t of textarea) {
            attr = t.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!t.classList.contains('ignore')) {
                if (document.getElementsByName(attr).length > 1 && [attr] in window) {
                    let o = window[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(t));
                        window[attr] = o;
                    } else {
                        window[attr] = [extractValue(t)];
                    }
                    // window[attr].push(extractValue(inpt));
                } else {
                    window[attr] = extractValue(t);
                }
            }
        }

        for (s of select) {
            attr = s.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!s.classList.contains('ignore')) {
                if (document.getElementsByName(attr).length > 1 && [attr] in window) {
                    let o = window[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(s));
                        window[attr] = o;
                    } else {
                        window[attr] = [extractValue(s)];
                    }
                    // window[attr].push(extractValue(inpt));
                } else {
                    window[attr] = extractValue(s);
                }
            }
        }

    } else {
        // get only of the pc children
        let input = pc.querySelectorAll('input');
        let select = pc.querySelectorAll('select');
        let textarea = pc.querySelectorAll('textarea');
        for (inpt of input) {
            attr = inpt.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!inpt.classList.contains("ignore")) {
                let tp = inpt.getAttribute('type');
                if (tp == 'radio' || tp == 'checkbox') {
                    if (inpt.checked) {
                        window[attr] = extractValue(inpt);
                    }
                    // Fix for cases when no checkbox is checked
                    if (isDOMElem(window[attr])) {
                        window[attr] = '0';
                    }
                } else {
                    if (document.getElementsByName(attr).length > 1 && [attr] in window) {
                        let o = window[attr];
                        console.log(o);
                        if (Array.isArray(o)) {
                            o.push(extractValue(inpt));
                            window[attr] = o;
                        } else {
                            window[attr] = [extractValue(inpt)];
                        }
                    } else {
                        window[attr] = extractValue(inpt);
                        o = window[attr];
                        console.log(o);
                    }
                    // window[attr] = extractValue(inpt);
                }
            }
        }
        for (t of textarea) {
            attr = t.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!t.classList.contains('ignore')) {
                if (document.getElementsByName(attr).length > 1 && [attr] in window) {
                    let o = window[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(t));
                        window[attr] = o;
                    } else {
                        window[attr] = [extractValue(t)];
                    }
                    // window[attr].push(extractValue(inpt));
                } else {
                    window[attr] = extractValue(t);
                }
            }
        }
        for (s of select) {
            attr = s.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!s.classList.contains('ignore')) {
                if (document.getElementsByName(attr).length > 1 && [attr] in window) {
                    let o = window[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(s));
                        window[attr] = o;
                    } else {
                        window[attr] = [extractValue(s)];
                    }
                    // window[attr].push(extractValue(inpt));
                } else {
                    window[attr] = extractValue(s);
                }
            }
        }
    }
}


function extractAsObject(selector = undefined) {
    let pc = null;
    if (typeof selector != 'undefined') {
        pc = document.querySelector(selector);
    }
    let obj = {};
    if (pc == null || typeof pc === 'undefined' || pc.length == 0) {
        // Just get all input select textarea variable and value
        let inpts = document.getElementsByTagName('input');
        let select = document.getElementsByTagName('select');
        let textarea = document.getElementsByTagName('textarea');

        if (inpts.length > 0) {
            for (inpt of inpts) {
                attr = inpt.getAttribute('name');
                if (typeof attr === 'undefined' || attr == null) {
                    continue;
                }
                attr = attr.replace("-", "_");
                attr = attr.replace(" ", "_");
                if (!inpt.classList.contains("ignore")) {
                    let tp = inpt.getAttribute('type');
                    if (tp == 'radio' || tp == 'checkbox') {
                        if (inpt.checked) {
                            obj[attr] = extractValue(inpt);
                        }
                        // Fix for cases when no checkbox is checked
                        if (isDOMElem(obj[attr])) {
                            obj[attr] = '0';
                        }
                    } else {
                        // Incase there is a name with array type in input
                        if ([attr] in obj) {
                            let o = obj[attr];
                            if (Array.isArray(o)) {
                                o.push(extractValue(inpt));
                                obj[attr] = o;
                            } else {
                                obj[attr] = [];
                                obj[attr].push(o);
                                obj[attr].push(extractValue(inpt));
                            }
                            // obj[attr].push(extractValue(inpt));
                        } else {
                            obj[attr] = extractValue(inpt);
                        }

                    }
                }
            }
        }

        for (t of textarea) {
            attr = t.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!t.classList.contains('ignore')) {
                // obj[attr] = extractValue(t);
                // Incase there is a name with array type in input
                if ([attr] in obj) {
                    let o = obj[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(t));
                        obj[attr] = o;
                    } else {
                        obj[attr] = [];
                        obj[attr].push(o);
                        obj[attr].push(extractValue(t));
                    }
                    // obj[attr].push(extractValue(inpt));
                } else {
                    obj[attr] = extractValue(t);
                }
            }
        }

        for (s of select) {
            attr = s.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!s.classList.contains('ignore')) {
                // obj[attr] = extractValue(s);
                // Incase there is a name with array type in input
                if ([attr] in obj) {
                    let o = obj[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(s));
                        obj[attr] = o;
                    } else {
                        obj[attr] = [];
                        obj[attr].push(o);
                        obj[attr].push(extractValue(s));
                    }
                    // obj[attr].push(extractValue(inpt));
                } else {
                    obj[attr] = extractValue(s);
                }
            }
        }

    } else {
        // get only of the pc children
        let input = pc.querySelectorAll('input');
        let select = pc.querySelectorAll('select');
        let textarea = pc.querySelectorAll('textarea');
        for (inpt of input) {
            attr = inpt.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!inpt.classList.contains("ignore")) {
                let tp = inpt.getAttribute('type');
                if (tp == 'radio' || tp == 'checkbox') {
                    if (inpt.checked) {
                        obj[attr] = extractValue(inpt);
                    }
                    // Fix for cases when no checkbox is checked
                    if (isDOMElem(obj[attr])) {
                        obj[attr] = '0';
                    }
                } else {
                    // Incase there is a name with array type in input
                    if ([attr] in obj) {
                        let o = obj[attr];
                        if (Array.isArray(o)) {
                            o.push(extractValue(inpt));
                            obj[attr] = o;
                        } else {
                            obj[attr] = [];
                            obj[attr].push(o);
                            obj[attr].push(extractValue(inpt));
                        }
                        // obj[attr].push(extractValue(inpt));
                    } else {
                        obj[attr] = extractValue(inpt);
                    }
                }
            }
        }
        for (t of textarea) {
            attr = t.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!t.classList.contains('ignore')) {
                // obj[attr] = extractValue(t);
                // Incase there is a name with array type in textarea
                if ([attr] in obj) {
                    let o = obj[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(t));
                        obj[attr] = o;
                    } else {
                        obj[attr] = [];
                        obj[attr].push(o);
                        obj[attr].push(extractValue(t));
                    }
                    // obj[attr].push(extractValue(inpt));
                } else {
                    obj[attr] = extractValue(t);
                }
            }
        }
        for (s of select) {
            attr = s.getAttribute('name');
            if (typeof attr === 'undefined' || attr == null) {
                continue;
            }
            attr = attr.replace("-", "_");
            attr = attr.replace(" ", "_");
            if (!s.classList.contains('ignore')) {
                // obj[attr] = extractValue(s);
                // Incase there is a name with array type in input
                if ([attr] in obj) {
                    let o = obj[attr];
                    if (Array.isArray(o)) {
                        o.push(extractValue(s));
                        obj[attr] = o;
                    } else {
                        obj[attr] = [];
                        obj[attr].push(o);
                        obj[attr].push(extractValue(s));
                    }
                    // obj[attr].push(extractValue(inpt));
                } else {
                    obj[attr] = extractValue(s);
                }
            }
        }
    }
    return obj;
}

function clearForm() {
    $('input[type="text"]').val('');
    $('input[type="number"]').val('0');
    let d = getFormattedDate(DT_FORMAT.DB_FORMAT_DATE);
    $('input[type="date"]').val(d);
    let t = getFormattedDate(DT_FORMAT.DB_FORMAT_TIME);
    $('input[type="time"]').val(t);
    $('textarea').val('');
    $('input[type="checkbox"]').prop("checked", false);
    $('input[type="radio"]').prop('checked', false);
}