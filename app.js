// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2020-07-26T17:01:17.194Z",
        "2020-07-28T23:36:17.929Z",
        "2020-08-01T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT", // de-DE
  };
  
  const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2020-04-10T14:43:26.374Z",
        "2020-06-25T18:49:59.371Z",
        "2020-07-26T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
  };
  
  const accounts = [account1, account2];
  
  /////////////////////////////////////////////////
  // Elements
  const labelWelcome = document.querySelector('.welcome');
  const labelDate = document.querySelector('.date');
  const labelBalance = document.querySelector('.balance__value');
  const labelSumIn = document.querySelector('.summary__value--in');
  const labelSumOut = document.querySelector('.summary__value--out');
  const labelSumInterest = document.querySelector('.summary__value--interest');
  const labelTimer = document.querySelector('.timer');
  
  const containerApp = document.querySelector('.app');
  const containerMovements = document.querySelector('.movements');
  
  const btnLogin = document.querySelector('.login__btn');
  const btnTransfer = document.querySelector('.form__btn--transfer');
  const btnLoan = document.querySelector('.form__btn--loan');
  const btnClose = document.querySelector('.form__btn--close');
  const btnSort = document.querySelector('.btn--sort');
  
  const inputLoginUsername = document.querySelector('.login__input--user');
  const inputLoginPin = document.querySelector('.login__input--pin');
  const inputTransferTo = document.querySelector('.form__input--to');
  const inputTransferAmount = document.querySelector('.form__input--amount');
  const inputLoanAmount = document.querySelector('.form__input--loan-amount');
  const inputCloseUsername = document.querySelector('.form__input--user');
  const inputClosePin = document.querySelector('.form__input--pin');
//  Function
const formatMovementDate  = function(date, locale){
    const calcDay = (day1, day2) => {
        Math.round(Math.abs(day1 - day2) / (1000 * 60 * 60 * 24));
    }

    const dayPass = calcDay(new Date, date);
    if(dayPass === 0) return "Today";
    if(dayPass === 1) return "Yesterday";
    if(dayPass <= 7) return `${dayPass} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
}


const formatCurrency = function(value, locale, currency){
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency
    }).format(value);
}

const displayMovements = function(acc, sort){
    containerMovements.innerHTML = '';

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
    
    movs.forEach((movement, index) => {
        const type = movement > 0 ? 'deposit' : 'withdrawal';
        const date = new Date(acc.movementsDates[index]);
        const displayDate = formatMovementDate(date, acc.locale)
        const html = `
                <div class="movements__row">
                    <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
                    <div class="movements__date">${displayDate}</div>
                    <div class="movements__value">${movement}€</div>
                </div>`
        containerMovements.insertAdjacentHTML('afterbegin', html)
    });
}

const createUsername = function(accounts){
    accounts.forEach(account => {
        account.username = account.owner
                .toLowerCase()
                .split(" ")
                .map(name => name[0])
                .join("")
    })
}
createUsername(accounts);

const calcDisplayBalance = function(account){
    account.balance = account.movements.reduce((total, current) => total += current, 0)
    labelBalance.textContent = formatCurrency(account.balance, account.locale, account.currency)
} 

const calcDisplaySummary = function(account){
    const comes = account.movements
    .filter( mov => mov > 0 )
    .reduce((sum, current) => sum += current, 0)
    labelSumIn.textContent = formatCurrency(comes, account.locale, account.currency)
    const outs = account.movements
    .filter(mov => mov < 0)
    .reduce((sum, current) => Math.abs(sum += current), 0)
    labelSumOut.textContent = formatCurrency(outs, account.locale, account.currency)

    const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(mov => mov > 0)
    .reduce((sum, current) => sum += current)
    .toFixed(2)

    labelSumInterest.textContent = formatCurrency(interest, account.locale, account.currency)
}

const updateUI = function(account){
    displayMovements(account)
    calcDisplayBalance(account);
    calcDisplaySummary(account);
}

const logoutTimer = function(){
    let time = 120;
    const tick = function(){
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const second = String(time % 60).padStart(2, 0);
        if(time === 0){
            clearInterval(timer);
            labelWelcome.textContent = "Log in to get started";
            containerApp.style.opacity = 0;
        }
        time--
        labelTimer.textContent = `${min}:${second}`
    }

    tick();
    const timer = setInterval(tick, 1000);
    return timer;
}

let timer;
let currentAccount;
btnLogin.addEventListener('click', function(e){
    e.preventDefault();
    currentAccount = accounts.find(account => account.username === inputLoginUsername.value)
    if(currentAccount.pin === +inputLoginPin.value){
        containerApp.style.opacity = 100;
        labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(" ")[0]}`;
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();

        const now = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };
        labelDate.textContent = Intl.DateTimeFormat(currentAccount.locale, options).format(now)
       
        if(timer) clearInterval(timer);
        timer = logoutTimer();

        updateUI(currentAccount);
    }
})

btnTransfer.addEventListener('click', function(e){
    e.preventDefault();
    const amountTranfer = +inputTransferAmount.value;
    const receiverAccount = accounts.find(account => account.username === inputTransferTo.value)
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferAmount.blur();

    if(receiverAccount && amountTranfer > 0 && currentAccount.balance >= amountTranfer && receiverAccount.username !== currentAccount.username){
        currentAccount.movements.push(-amountTranfer);
        receiverAccount.movements.push(amountTranfer);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAccount.movementsDates.push(new Date().toISOString());
        updateUI(currentAccount);
        clearInterval(timer);
        timer = logoutTimer();
    }
})

btnLoan.addEventListener('click', function(e){
    e.preventDefault();
    const amountLoan = +inputLoanAmount.value;
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
    if(amountLoan > 0 && currentAccount.movements.some(mov => mov > amountLoan * 0.1)){
        setTimeout(function(){
            currentAccount.movements.push(amountLoan);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateUI(currentAccount);
            clearInterval(timer);
            timer = logoutTimer();
        }, 2500)
    }
})

btnClose.addEventListener('click', function(e){
    e.preventDefault();
    if(currentAccount.username === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value){
        const index = accounts.findIndex(account => account.username === inputCloseUsername.value)
        accounts.splice(index, 1);
        containerApp.style.opacity = 0;
    }
    inputCloseUsername.value = inputClosePin.value = "";
})

let sorted = false;
btnSort.addEventListener('click', function(e){
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted
})