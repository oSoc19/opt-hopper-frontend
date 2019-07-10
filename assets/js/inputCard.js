function getInputFromCard(){
    $(".inputCard").hide();
    $(".tabsContainer, .detailViewContainer").show();

    let input = {from: "", to: "", date: ""}

    input.from = $('#fromInput').val()
    input.to = $('#toInput').val()
    
    var date = $('#dateInput').val(),
    time = $('#timeInput').val()

    input.date = new Date(date + " " + time)
    
    console.log(input)
    
}