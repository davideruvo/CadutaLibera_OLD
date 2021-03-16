$(document).ready(function () {
    init();
    function init() {
        createLogo();
        $('.instructions').off('click').on('click', function () {
            openModal({
                content: 'Questa funzionalit&agrave; permette di agire sulle domande salvate.<br/>' +
                    'Il formato utilizzato &egrave; <span style="font-style:italic;font-family:monospace">risposta</span>|<span style="font-style:italic;font-family:monospace">domanda</span>.<br/>' +
                    'Ad ogni riga corrisponde una domanda diversa e si possono inserire fino a 1000 righe alla volta.<br/>' +
                    'Le lettere visibili della risposta saranno quelle precedute dal carattere %.<br/>' + 
                    '<div class="warning pad-5 vspace-5"><span class="bold">Attenzione:</span> Tutte le azioni sono irreversibili, quindi &egrave; necessario conservare una copia dei dati.</div>',
                maxWidth: 800
            });
        });
        $('.btn-download').tooltip({ content: 'Scarica dati', type: constants.messageType.info, left: true })
            .off('click').on('click', downloadData);
        $('.btn-append').tooltip({ content: 'Inserisci dati', type: constants.messageType.info, left: true })
            .off('click').on('click', appendData);
        $('.btn-delete').tooltip({ content: 'Elimina tutti i dati', type: constants.messageType.info, left: true })
            .off('click').on('click', deleteData);
        $('.main textarea').off('input').on('input', function (ev) { disabledAppend($(ev.target).val().length === 0); });
    }
    function downloadData() {
        if ($('.main textarea').val() === '') {
            readQuestions();
        }
        else {
            openModal({
                content: 'Le modifiche non salvate andranno perse. Continuare?',
                buttons: [
                    { text: 'Ok', cssClass: 'btn btn-round', close: true, click: readQuestions },
                    { text: 'Annulla', cssClass: 'btn btn-round', close: true },
                ]
            });
        }
    }
    function readQuestions() {
        ajaxCall('/api/ReadAll', 'get',
            {
                success_callback: function (result) {
                    var textData = '';
                    $.each(result.Items, function (i, e) {
                        textData += e.word + '|' + e.question + (i < result.Items.length - 1 ? '\n' : '');
                    });
                    $('.main textarea').val(textData);
                    disabledAppend(true);
                }
            });
    }
    function appendData() {
        var param = [];
        $.each($('.main textarea').val().split('\n'), function (i, e) {
            var l = e.split('|');
            param.push({ word: l[0], question: l[1] });
        });
        ajaxCall('/api/MultiCreate', 'post',
            {
                param: param,
                success_callback: function (result) {
                    openModal({ content: 'Inserimento completato', type: constants.messageType.info });
                    $('.main textarea').val('');
                    disabledAppend(true);
                },
                error_callback: function (error) {
                    if (error.isTimeout) {
                        openModal({ content: 'Timeout della richiesta.<br/>L\'operazione potrebbe essere ancora in corso.<br/>Attendere qualche istante e provare a rileggere i dati.', type: constants.messageType.warning });
                    }
                    else {
                        openModal({ content: 'Inserimento non completato', type: constants.messageType.error });
                    }
                }
            });
    }
    function disabledAppend(value) {
        $('.btn-append').prop('disabled', value);
    }
    function deleteData() {
        openModal({
            content: 'Tutti i dati saranno eliminati. Continuare?',
            buttons: [
                { text: 'Ok', cssClass: 'btn btn-round', close: true, click: deleteQuestions },
                { text: 'Annulla', cssClass: 'btn btn-round', close: true },
            ]
        });
    }
    function deleteQuestions() {
        ajaxCall('/api/DeleteAll', 'post',
            {
                success_callback: function (result) {
                    openModal({ content: 'Operazione completata', type: constants.messageType.info });
                    $('.main textarea').val('');
                    disabledAppend(true);
                },
                error_callback: function (error) {
                    if (error.isTimeout) {
                        openModal({ content: 'Timeout della richiesta.<br/>L\'operazione potrebbe essere ancora in corso.<br/>Attendere qualche istante e provare a rileggere i dati.', type: constants.messageType.warning });
                    }
                    else {
                        openModal({ content: 'Operazione non completata', type: constants.messageType.error });
                    }
                }
            });
    }
});