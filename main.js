const mtncards = [
  
  {
    id:1,
    amount:"1GB",
    price:5,
    validity:"valid for 30 days"
    
  },
  
  
  {
    id:2,
    amount:"2GB",
    price:10,
    validity:"valid for 30 days"
    
  },
  
  
  {
    id:3,
    amount:"5GB",
    price:25,
    validity:"valid for 40 days"
    
  },
  
  
  {
    id:4,
    amount:"10GB",
    price:50,
    validity:"valid for 60 days"
    
  },
  
  
  {
    id:5,
    amount:"20GB",
    price:100,
    validity:"valid for 90 days"
    
  }
  
];

const cards = document.getElementById("bundle-cards")

function displaycards(){
  
  cards.innerHTML = ''
  
  mtncards.forEach(card => {
    cards.innerHTML += `
    
    <div class="card">
    
    <h1>${card.amount}</h1>
    <br>
    
    <p>${card.validity}</p>
    
    <p>---------------</p>
    
    <h2>GHS  ${card.price}.00</h2> 
    
    <button onclick="show('paymentpage'); selectcard(${card.id})">Buy Now</button>
    
    
    </div>
    
    
    `
  } )
}

displaycards()


const pages = document.querySelectorAll(".page")

function show(pageId){
  pages.forEach(page => {
    page.classList.remove("active")
  } )
  
  document.getElementById(pageId).classList.add("active")
}

let selected= null

function selectcard(id){
  const selectedcard = mtncards.find(card => card.id === id)
  
  selected = selectedcard;
  
  document.getElementById("cardamount").innerHTML = selectedcard.amount
  
  document.getElementById("cardprice").innerHTML = selectedcard.price
  
}




const orderdisplay = document.getElementById("ordersdisplayed")

const orders = JSON.parse(localStorage.getItem("orders")) || []

function displayorder() {
  
   orderdisplay.innerHTML = ''
 
 orders.forEach( (order, index) => {
   
   orderdisplay.innerHTML += `
   
   <div class="order">
   
   <h2>MTN: ${order.amount}</h2>
   
   <p>Recipient: ${order.num}</p>
   
   <p>Price:  GHS ${order.price}.00</p>
   
   <p>Data: ${order.date}</p>
   
   <p class="status">Status: ${order.status}</p>
   
   </div>
   
   `
})

}

displayorder()

const comments = JSON.parse(localStorage.getItem("comment")) || []

display()



function  addcomment(){
  
  const confirmpost = confirm("are sure to post this comment")
  
  if(!confirmpost){
    return;
  }
  
  const name = document.getElementById("name").value.trim()
  const comment = document.getElementById("comment").value.trim()
  
  if(!name || !comment){
    alert("please enter name or comment")
    return;
  }
  
  const now = new Date()
  
  comments.push( {
    name:name,
    comment:comment,
    time:now.toLocaleTimeString(),
    date:now.toLocaleDateString()
  } )
  
  document.getElementById("name").value=""
  document.getElementById("comment").value=""
  
  display()
  save()
 
 
 
}




function display(){
  
  const displaycomment = document.getElementById("commentsdisplayed")
  
  displaycomment.innerHTML = ''
  
  comments.forEach((comment, index) => {
    
    displaycomment.innerHTML += `
    
    <div class="comment">
    
    <h3>${comment.name}</h3>
    
    <p>${comment.comment}</p>
    
    <button onclick="deletecomment('${index}')">delete</button><br>
    
    <span>------ ${comment.date} - ${comment.time} -----</span>
    
    
    </div>
    
    `
  } )
  
  
}
  
  
  function buybundle() {
  
  if (!selected) {
    alert("please select a card first");
    return;
  }
  
  const num = document.getElementById("number").value;
  const email = document.getElementById("email").value.trim();
  
  if (!num || !email) {
    alert("please enter number and email");
    return;
  }
  
  const confirmpay = confirm("are you sure to buy this card");
  
  if (!confirmpay) {
    return;
  }
  
  console.log("Purchase button clicked");
console.log("Product:", selected);
console.log("Phone:", num);
  
  const amountinpessewas = selected.price * 100;
  
  const paystack = new PaystackPop();
  
  paystack.newTransaction({
    
    key: "pk_test_ce82e97bdedd256846b71305ba244718386f899f",
    
    email: email,
    
    amount: amountinpessewas,
    
    currency: "GHS",
    
    phone: num,
  
  metadata: {
    network: "MTN",
    bundle: selected.amount,
    recipient: num
  },
  
  onSuccess: async (transaction) => {
      
      console.log("Paystack payment completed");
      console.log("Reference:", transaction.reference);
      
      try {
        
        const response = await fetch(
          `https://freedatagh-backend.onrender.com/verify-payment/${transaction.reference}`
        );
        
        const result = await response.json();
        
        console.log("Verification result:", result);
        if (result.success) {
  
  console.log("Payment verified by backend");
  
  const now = new Date();
  
  const neworder = {
    amount: selected.amount,
    price: selected.price,
    num: num,
    date: now.toLocaleDateString(),
    status: "paid",
    reference: transaction.reference
  };
  
  orders.push(neworder);
  
  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );
  
  show("orders");
  
  displayorder();
  
  alert(
    "Payment verified successfully!\n" +
    "Reference: " +
    transaction.reference
  );
  
} else {
  
  alert(
    "Payment could not be verified.\n" +
    result.message +
    "\n" +
    JSON.stringify(result.details)
  );
  
}
        
      } catch (error) {
        
        console.error("Verification error:", error);
        
        alert(
          "Payment was completed, but we could not contact the verification server."
        );
        
      }
      
    }
     
  });
  
}
  
  


function deletecomment(index){
  comments.splice(index, 1)
  display()
  save()
}

function  save(){
  localStorage.setItem("comment", JSON.stringify(comments))
}



const btns = document.querySelectorAll(".nav-btns .btn")

btns.forEach(btn => {
  
  btn.addEventListener('click', function() {
    
    btns.forEach(button => {
      button.classList.remove("hover")
    } )
    
    btn.classList.add("hover")
    
  } )
} )
