const API_URL = "https://ltimfs712g.execute-api.eu-north-1.amazonaws.com/prod/expenses";

let expenses = [];
let total = 0;


// ADD EXPENSE
window.addExpense = async function() {

    const name = document.getElementById("expenseName").value;
    const amount = Number(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;

    if (!name || !amount) {
        alert("Please enter expense name and amount.");
        return;
    }

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: window.currentUserId,
                name: name,
                amount: amount,
                category: category
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to save expense");
        }

        alert("Expense saved successfully!");

        document.getElementById("expenseName").value = "";
        document.getElementById("expenseAmount").value = "";

        // Reload expenses from DynamoDB
        await window.loadExpenses();

    } catch (error) {

        console.error("Error:", error);

        alert("Error saving expense: " + error.message);
    }
};


// LOAD EXPENSES
window.loadExpenses = async function() {

    if (!window.currentUserId) {
        console.log("User not logged in yet.");
        return;
    }

    try {

        const response = await fetch(
            API_URL + "?userId=" + encodeURIComponent(window.currentUserId)
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load expenses");
        }

        expenses = data;

        total = expenses.reduce(function(sum, expense) {
            return sum + Number(expense.amount);
        }, 0);

        document.getElementById("total").textContent = total;

        displayExpenses();

    } catch (error) {

        console.error("Error loading expenses:", error);

    }
};


// DISPLAY EXPENSES
function displayExpenses() {

    const list = document.getElementById("expenseList");

    list.innerHTML = "";

    expenses.forEach(function(expense) {

        const item = document.createElement("div");

        item.innerHTML =
            `<p>
                <strong>${expense.name}</strong>
                - ₹${expense.amount}
                (${expense.category})
            </p>`;

        list.appendChild(item);

    });
}


// WAIT FOR COGNITO LOGIN
window.addEventListener("DOMContentLoaded", function() {

    setTimeout(function() {
        window.loadExpenses();
    }, 1000);

});


// DARK / LIGHT MODE
window.toggleTheme = function() {

    document.body.classList.toggle("light-mode");

    const themeButton = document.getElementById("themeButton");

    if (document.body.classList.contains("light-mode")) {
        themeButton.textContent = "🌙";
    } else {
        themeButton.textContent = "☀️";
    }

};