$('.sbmt').on('click', () => {
    var action = $(".sbmt").data("action");
    // clog('Data: ' + action);
    switch (action) {
        case "stream":
            // clog('Data: ' + action);
            break;
        case "course":
            const $stream_name = $("#stream_name");
            var stream_name = $stream_name.val();
            break;
    
        default:
            break;
    }
});