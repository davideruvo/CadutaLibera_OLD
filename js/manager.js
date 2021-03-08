$(document).ready(function () {
    init();
    function init() {
        createLogo();
        $('.btn-load').tooltip({ content: 'Leggi dati', type: constants.messageType.info, left: true })
            .off('click').on('click', loadData);
        $('.btn-update').tooltip({ content: 'Aggiorna dati', type: constants.messageType.info, left: true })
            .off('click').on('click', updateData);
    }
    function loadData() {
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