// Initialize formatter for money
var moneyFormatter;

$(document).ready(function () {

    loadSnacks();
    // Populate formatter for money.
    moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });     
});

/* Modify money by given value */
function addMoney(id, amount, formatter) {
    /* Parse and restructure currency after editing */
    var money = $(id).val().replace("$", "") * 100 + amount;
    money = money / 100;
    $(id).val(formatter.format(money));
};

/* Populate snack cards */
function loadSnacks() {
    $.ajax({
        type: "GET",
        url: "http://vending.us-east-1.elasticbeanstalk.com/items"
    })
    .done(function(snackArray) {                     
        /* Populate each card with API data */         
        for (let i = 1; i <= 9; i++) {
            /* For each array element up to 9, reveal and populate snack cards */
            if (snackArray[i-1] !== undefined) {
                $("#card-snack-"+i).css("visibility", "visible");
                $("#card-snack-"+i+"-title").text(snackArray[i-1].id);
                $("#card-snack-"+i+"-name").text(snackArray[i-1].name);
                $("#card-snack-"+i+"-price").text("$"+snackArray[i-1].price);
                $("#card-snack-"+i+"-quantity").text("Quantity Left: "+snackArray[i-1].quantity);
            } else {
                $("#card-snack-"+i).css("visibility", "hidden");
            }; 
        };
    })
    .fail(function(xhr) {
        alert(xhr.responseText);
    });
}

/* Toggle background of cards and buttons on hover */
$(".card, .button").hover(
    // in callback
    function () {
        $(this).css("background-color", "rgb(190, 180, 180)");
    },
    // out callback
    function () {
        $(this).css("background-color", "rgb(255, 255, 255)");
});

/* Populate snack ID/Message based on card clicked */
$(".card").click(function() {
    $("#displayitemid").val($("#" + this.id + "-title").text());     
    $("#displaymessages").val("Buy: " + $("#" + this.id + "-name").text());
    $("#displaychange").val("");
  });

/* Increment money buttons */
$("#btn-add-dollar").click(function() {
    addMoney("#displaymoney", 100, moneyFormatter);   
    $("#displaychange").val("");
});
$("#btn-add-quarter").click(function() {
    addMoney("#displaymoney", 25, moneyFormatter);   
    $("#displaychange").val("");
});
$("#btn-add-dime").click(function() {
    addMoney("#displaymoney", 10, moneyFormatter);   
    $("#displaychange").val("");
});
$("#btn-add-nickel").click(function() {
    addMoney("#displaymoney", 5, moneyFormatter);   
    $("#displaychange").val("");
});

/* Make purchase button click */
$("#btn-buy").click(function() {
    if ($("#displayitemid").val() === undefined || $("#displayitemid").val() === "") {
        $("#displaymessages").val("Please select an item");
        $("#displaychange").val("");
        return;
    }

    /* Get ID and money balance */
    var id = $("#displayitemid").val();
    var amount = $("#displaymoney").val().replace("$", "");

    /* Send API call */
    $.ajax({
        type: "POST",
        url: `http://vending.us-east-1.elasticbeanstalk.com/money/${amount}/item/${id}`,
        dataType: "json"
    })
    /* Success */
    .done(function(returnBody) {                     
        /* Reset change */         
        $("#displaychange").val("");
        /* Populate change display from JSON */
        var quarters = returnBody.quarters;
        var dimes = returnBody.dimes;
        var nickels = returnBody.nickels;
        var pennies = returnBody.pennies;
        displayCoins(quarters, dimes, nickels, pennies);     
        /* Update display forms */    
        $("#displaymoney").val("$0.00");   
        $("#displaymessages").val("Thank You!!");
        $("#displayitemid").val("");
    })
    /* Error */
    .fail(function(returnBody) {
        /* Display error message */
        var message = JSON.parse(returnBody.responseText).message;
        $("#displaymessages").val(message); 
        $("#displaychange").val("");
    })
    /* Finally */
    .always(function(returnBody){
        loadSnacks();
    });
});

/* Change return button click */
$("#btn-change-return").click(function() {
    $("#displaychange").val("");
    var moneyIn = $("#displaymoney").val().replace("$", "") * 100;
    moneyIn = Math.round(moneyIn);
    $("#displaymoney").val("$0.00");
    $("#displaychange").val("");
    if (moneyIn <= 0) { 
        $("#displaymessages").val("");
        return; 
    }
    var quarters = 0;
    var dimes = 0;
    var nickels = 0;
    var pennies = 0;
  
    /* Enumerate total coins of each type */
    while (moneyIn >= 25) {
        moneyIn -= 25;
        quarters++;
    }
    while (moneyIn >= 10) {
        moneyIn -= 10;
        dimes++;
    }
    while (moneyIn >= 5) {
        moneyIn -= 5;
        nickels++;
    }
    while (moneyIn >= 1) {
        moneyIn -= 1;
        pennies++;
    }
    /* Update coin display */
    displayCoins(quarters, dimes, nickels, pennies);
    $("#displaymessages").val("Change returned");
    $("#displayitemid").val("");
});

/* Populate coins display */
function displayCoins(quarters, dimes, nickels, pennies) {
    var displayme ="";
    
    if (quarters > 0) {
        if (dimes > 0 || nickels > 0 || pennies > 0)
        {
            displayme = `Quarters: ${quarters}, `;
        } else {
            displayme = `Quarters: ${quarters}`;
        }
    }
    if (dimes > 0) {
        if (nickels > 0 || pennies > 0)
        {
            displayme += `Dimes: ${dimes}, `;
        } else {
            displayme += `Dimes: ${dimes}`;
        }
    }
    if (nickels > 0) {    
        if (pennies > 0)
        {
            displayme += `Nickels: ${nickels}, `;
        } else {
            displayme += `Nickels: ${nickels}`;
        }
    }
    if (pennies > 0) {
        displayme += `Pennies: ${pennies}`;
    }

    $("#displaychange").val(displayme);
}