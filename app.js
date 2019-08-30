
// building a MODULE PATTERN with IIFE - immediately invoked function. All that's inside cannot be access from the outside

// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    
// data structur: one object to store everything, consisting of two objects: allItems to hold exp and inc & totals to hold totals of expenses and incomes, which consist of arrays / zeros;
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            // ID is last item in the Expense/Income object, from which we retrive id and add 1 - to assign the next number in sequence
            } else {
                ID = 0;
            }
            

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID,des,val);
                
            } else if (type === 'inc') {
                newItem = new Income(ID,des,val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        testing: function() {
            console.log(data);
        }
    };

})();

// the secret of MODULE PATTERN is that it RETURNs all of the objects and functions that we want to be PUBLIC i.e. all of the functions and objects we want to give outside scope to have access to

// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn'
    }

    return {
        getInput: function() { //we are returning an object which is a function
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            }
        },
        getDomStrings: function() {
            return DOMstrings;
        }
    }

})();

// seperation of concerns - parts of application should be concerned solely with doing their own thing. That's we are doing here with budet controller and ui controller

// GLOBAL APP CONTROLLER - it's telling other modules what to do
var controller = (function(budgetCtrl, UICtrl) { //actual names of the other two controllers were passed where function was invoked. Inside this controller we'll always use budgetCtrl & UICtrl

    var setupEventListeners = function() {

        var DOM = UICtrl.getDomStrings(); // because the UI controller returned an object, hence we it's method exactly like an object's

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // adding key press listener
        document.addEventListener('keypress', function(event) { // adding parameter for eventListerner function which will reference return key press

            if (event.keyCode === 13 || event.which === 13) { // which is the keyCode property for older browsers
                ctrlAddItem();
            }
        });
    };



    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();
        // 2. Add item to budget controler
        newItem = budgetController.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI

        // 4. Calculate the budget

        // 5. Display the budget on the UI

    }

    // we have to somehow call the setupEventListeners function. We want it to be public so we have to return it as an object
    return {
        init: function() {
            console.log('app started');
            setupEventListeners();
        }
    }


})(budgetController, UIController); //this controller needs to know about the other two, so we'll pass them in here as parameters

controller.init();