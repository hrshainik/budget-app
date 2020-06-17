// Budget controller
// ================
const budgetController = (() => {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const claculateTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach((cur, i) => {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem(type, des, val) {
      let newItem, ID;

      // Create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into out data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem(type, id) {
      let ids, index;

      // id = 6;
      // data.allItems[type][id];
      // ids = [1, 2, 4, 6, 8] (element 0, 3, 5, 7 are deleted)
      // index = 3

      ids = data.allItems[type].map((item) => {
        return item.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {
      // Calculate total income and expenses
      claculateTotal("exp");
      claculateTotal("inc");

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages() {
      /**
       * a = 20
       * b = 10
       * c = 40
       * income = 100
       * a = 20 / 100 = 20%
       * b = 10%
       * c = 40%
       */

      data.allItems.exp.forEach((exp) => {
        exp.calcPercentage(data.totals.inc);
      });
    },

    getPercentages() {
      let allPerc = data.allItems.exp.map((exp) => {
        return exp.getPercentage();
      });
      return allPerc;
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
  };
})();

// UI controller
// ============
const UIController = (() => {
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabe: ".budget__title--month",
  };

  const formatNumber = (num, type) => {
    let numSplit, int, dec;
    /**
     * + or - before number
     * exactly 2 decimal points
     * comma separating the thousands
     *
     * 2310.4567 -> +2,310.46
     * 2000 -> +2,000.00
     */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return `${type === "exp" ? "-" : "+"} ${int}.${dec}`;
  };

  const nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem(obj, type) {
      let html, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = `
        <div class="item clearfix" id="inc-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
            <div class="item__value">${formatNumber(obj.value, type)}</div>
            <div class="item__delete">
              <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i>
              </button>
            </div>
          </div>
        </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html = `
        <div class="item clearfix" id="exp-${obj.id}">
          <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value, type)}</div>
              <div class="item__percentage"></div>
              <div class="item__delete">
              <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i>
              </button>
            </div>
          </div>
        </div>`;
      }

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },

    deleteListItem(selectorID) {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearField() {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArr = Array.from(fields);

      fieldsArr.forEach((field, i) => {
        field.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget(obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages(percentages) {
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth() {
      let now = new Date();
      let year = now.getFullYear();

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      let month = now.getMonth();
      document.querySelector(DOMstrings.dateLabe).textContent =
        months[month] + " " + year;
    },

    changedType() {
      const fields = document.querySelectorAll(
        `${DOMstrings.inputType},${DOMstrings.inputDescription},${DOMstrings.inputValue}`
      );

      nodeListForEach(fields, (cur) => {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings() {
      return DOMstrings;
    },
  };
})();

// Global app controller
// ====================
const controller = ((budgetCtrl, UICtrl) => {
  const setupEventListener = () => {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (e) => {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  const updateBudget = () => {
    // Calculate the budget
    budgetCtrl.calculateBudget();

    // Return the budget
    let budget = budgetCtrl.getBudget();

    // Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    // Calculate percentages
    budgetCtrl.calculatePercentages();

    // Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    let input, newItem;

    // Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // Clear the fields
      UICtrl.clearField();

      // Calculate the budget and update the budget
      updateBudget();

      // Calculate and update the percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = (e) => {
    let itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-$ or exp-$
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // Delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      // Delete the item from UI
      UICtrl.deleteListItem(itemID);

      // Update and show the new budget
      updateBudget();

      // Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    init() {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UIController);

controller.init();
