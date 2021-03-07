$(document).ready(function () {
    $.ajax({
        method: "GET",
        url: "/api/getQuestions"
    }).done(function (result) {
        console.log("Data: ", result);
    });
});