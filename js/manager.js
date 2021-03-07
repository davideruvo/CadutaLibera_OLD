$(document).ready(function () {
    init();
    function init() {
        loadQuestions();
        $('.controls').append($('<button>').tooltip({ content: 'Aggiorna dati', type: constants.messageType.info, left: true }).addClass('btn-apply').addClass('btn btn-circle shadow')
            .append($('<i>').addClass('bi bi-upload'))
            .on('click', updateData));
    }
    function loadQuestions() {
        ajaxCall('/api/getQuestions', 'get',
            {
                success_callback: function (result) {
                    var textData = '';
                    $.each(result.Items, function (i, e) {
                        textData += e.word + '|' + e.def + (i < result.Items.length - 1 ? '\n' : '');
                    });
                    $('textarea.manager').val(textData);
                }
            });
    }
    function updateData() {
        var param = [];
        $.each($('textarea.manager').val().split('\n'), function (i, e) {
            var l = e.split('|');
            param.push({ word: l[0], def: l[1] });
        });
        ajaxCall('/api/batchCreate', 'post',
            {
                param: param,
                success_callback: function (result) {
                    openModal({ content: 'Aggiornamento completato', type: constants.messageType.info });
                },
                error_callback: function (result) {
                    openModal({ content: 'Aggiornamento non completato', type: constants.messageType.warning });
                }
            });
    }
});