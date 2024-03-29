
// building a MODULE PATTERN with IIFE - immediately invoked function. All that's inside cannot be access from the outside

// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id,description,value, perc) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // we are modifying and object's property perc here, so it's best to build this object's method and call it on each object we'll have in the array
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0 ) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    Expense.prototype.freshPerc = function() {
        var targ, parentDOM, element;
        targ = UIController.getDomStrings();
        parentDOM = document.getElementById('exp-' + this.id);
        element = parentDOM.childNodes[3].childNodes[3]; // refactoring required - now childNodes are harcoded - need to replace that with dynamic loop over array of nodes
        element.textContent = this.perc + '%';
    }
    

    var Income = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    
// data structure: one object to store everything, consisting of two objects: allItems to hold exp and inc & totals to hold totals of expenses and incomes, which consist of arrays / zeros;
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // we use -1 for things that don't exist
    };

    return {
        addItem: function(type, des, val, perc) {
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            // ID is last item in the Expense/Income object, from which we retrive id and add 1 - to assign the next number in sequence
            } else {
                ID = 0;
            }


            
            // create new item based on 'inc' or 'exp' type
            if (type === 'exp' && des !== '' && val !== NaN) {
                newItem = new Expense(ID,des,val, perc);
                
            } else if (type === 'inc' && des !== '' && val !== NaN) {
                newItem = new Income(ID,des,val);
            } 

            // Push it into our data structure
            data.allItems[type].push(newItem);


            // Return the new element
            return newItem;
        },

        deleteItem: function(type,id) {
            var ids, index;

            /*
                var new_array = arr.map(function callback(currentValue[, index[, array]]) {
                // Return element for new_array
                }[, thisArg])
            callback - Function that produces an element of the new Array, taking three arguments:
            currentValue - The current element being processed in the array.
            indexOptional - The index of the current element being processed in the array.
            arrayOptional - The array map was called upon.
            thisArgOptional - Value to use as this when executing callback.
            Return value - A new array with each element being the result of the callback function.
            */
            ids = data.allItems[type].map(function(current) { // so when we say current in the callback function, we mean the current element (either exp or inc) of the array we use map on. Elements of that array contain objects with parameters .id .description .value.
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1); // splice method uses first argument for index of item where it should start deleting and then a delete count i.e. how many items it should delete
            }
            
        },

        calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate % of income that we spent
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // which means this value does not exist
            }

        },

        calculatePercentages: function() {
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40%
            */

            // calculate and return % of total expenses

            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc; // return an array with all percentages for each expense
        },

        getBudget: function() {
            return {
                expenses: data.totals.exp,
                incomes: data.totals.inc,
                percent: data.percentage,
                budget: data.budget
            } 
        },

        getExp: function() {
            return data.allItems.exp;
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
        inputBtn: '.add__btn',
        container: '.container',
        deleteBtn: '.item__delete--btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        expenseDisplay: '.budget__expenses--value',
        incomeDisplay: '.budget__income--value',
        percDisplay: '.budget__expenses--percentage',
        budgetDisplay: '.budget__value',
        itemPerc: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // private function because we will not use it outside of this controller:

    var formatNumber = function(num,type) {
        var numSplit, int, dec;
        /*
        + or - before the number
        exactly 2 decimal places
        comma separating the thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.')
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
        }

        dec = numSplit [1];
        // type === 'exp' ? sign = '-' : sign = '+'; // ternary notation of the string
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() { //we are returning an object which is a function
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        
        addListItem: function(obj, type, perc) {
            var html, newHtml, element;
            
            //console.log('addListItem', budget.expenses);
            // create HTML string with placeholder text

            if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i></button> </div> </div> </div>'

            } else if ( type === 'exp') {
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">%percent%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';

            }
            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        /*
        updateListPerc: function(list) {
            // loop over array of list items and update their %
            list.forEach(function(current) {
                current.freshPerc();
            });
        },
        */

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el); // in JavaScript you can only delete a child element, so we had totraverse the DOM up from income-x to it's parent and then remove it's child - which is the income-x element
        },

        clearFields: function(){

            // select all fields that need to be cleared and store them into a variable
            // here this variable is fields and it's a list - we need an array
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // we can't JUST call slice method on the fields variable, but we can create a new variable and call slice by using call(fields)
            fieldsArr = Array.prototype.slice.call(fields);
  
            // loop over fieldsArr, select each value of array and change it's value to ""
            
            fieldsArr.forEach(function(current) {
                current.value = "";
            });

            // adding focus to description field
            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetDisplay).textContent = formatNumber(obj.budget, type);

            document.querySelector(DOMstrings.incomeDisplay).textContent = formatNumber(obj.incomes, 'inc');

            document.querySelector(DOMstrings.expenseDisplay).textContent = formatNumber(obj.expenses, 'exp');
            
            if (obj.percent > 0) {
                document.querySelector(DOMstrings.percDisplay).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOMstrings.percDisplay).textContent = '---';
            }
        },

        displayPercentages: function(percentages){

             var fields = document.querySelectorAll(DOMstrings.itemPerc);

             nodeListForEach(fields, function(current,index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; // we want to display percentage at each position of the array
                } else {
                    current.textContent = '---';
                }
             });

        },

        displayMonth: function(){
            var now, year, month, months;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue

            );

                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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

        // event handler for removing an item - challange: deleteBtn is unavailable until exp is added to the list. SOLUTION: use event delegation to setup event listener on parent element (of both exp and inc elements)
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the user interface with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem, list;

        // 1. Get the field input data
        input = UICtrl.getInput();

            if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
                // 2. Add item to budget controler
                newItem = budgetController.addItem(input.type, input.description, input.value);
  

                // 3. Add the item to the UI
                UIController.addListItem(newItem, input.type);

                // 4. Clear the fields
                UIController.clearFields();
                
                //5. Calculate and update budget
                updateBudget();

                //6. Calculate and update percentages
                updatePercentages();
        }
    
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // we traverse the DOM by using parentNode to the right div containing the unique ID, which we then read by using the .id property
        // there are no other ID elements on the page other than the one in the listItem - we can use this fact

        if (itemID) {
            //inc-1
            splitID = itemID.split('-'); // produces an array ['inc','1']
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        // 1. Delete the item from the data structure
        budgetCtrl.deleteItem(type,ID);

        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);
        // 3. Re-calculate the budget & 4. Update the UI
        updateBudget();
        
        // 4. Calculate and update percentages
        updatePercentages();

    };

    // we have to somehow call the setupEventListeners function. We want it to be public so we have to return it as an object
    return {
        init: function() {
            console.log('app started');
            UIController.displayMonth();
            UICtrl.displayBudget({
                expenses: 0,
                incomes: 0,
                percent: '---',
                budget: 0
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController); //this controller needs to know about the other two, so we'll pass them in here as parameters

controller.init();