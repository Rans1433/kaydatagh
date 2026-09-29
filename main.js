const BACKEND_URL =
  "https://freedatagh-backend.onrender.com";


const mtncards = [

  {
    id: 1,
    amount: "1GB",
    price: 4.8,
    validity: "valid for 90 days"
  },

  {
    id: 2,
    amount: "2GB",
    price: 9.8,
    validity: "valid for 90 days"
  },

  {
    id: 3,
    amount: "5GB",
    price: 23.8,
    validity: "valid for 90 days"
  },

  {
    id: 4,
    amount: "10GB",
    price: 48,
    validity: "valid for 90 days"
  },

  {
    id: 5,
    amount: "20GB",
    price: 96,
    validity: "valid for 90 days"
  }

];


const cards = document.getElementById("bundle-cards");


function displaycards() {

  cards.innerHTML = "";

  mtncards.forEach(card => {

    cards.innerHTML += `

      <div class="card">

        <h1>${card.amount}</h1>

        <br>

        <p>${card.validity}</p>

        <p>---------------</p>

        <h2>GHS ${card.price}</h2>

        <button
          onclick="show('paymentpage'); selectcard(${card.id})">
          Buy Now
        </button>

      </div>

    `;

  });

}


displaycards();


const pages = document.querySelectorAll(".page");


function show(pageId) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  document
    .getElementById(pageId)
    .classList.add("active");
}


let selected = null;


function selectcard(id) {

  const selectedcard =
    mtncards.find(card => card.id === id);

  selected = selectedcard;

  document.getElementById("cardamount").innerHTML =
    selectedcard.amount;

  document.getElementById("cardprice").innerHTML =
    selectedcard.price;

}


// ==========================================
// ORDERS
// ==========================================

const orderdisplay =
  document.getElementById("ordersdisplayed");


const orders =
  JSON.parse(localStorage.getItem("orders")) || [];


// ==========================================
// FORMAT STATUS
// ==========================================
function formatStatus(status) {

  if (!status) {
    return "Processing";
  }

  const cleanStatus =
    String(status).toLowerCase().trim();

  if (
    cleanStatus.includes("pending") ||
    cleanStatus.includes("waiting") ||
    cleanStatus.includes("processing") ||
    cleanStatus.includes("queue")
  ) {
    return "Processing";
  }

  if (
    cleanStatus.includes("completed") ||
    cleanStatus.includes("complete") ||
    cleanStatus.includes("success")
  ) {
    return "Delivered";
  }

  if (
    cleanStatus.includes("failed") ||
    cleanStatus.includes("failure")
  ) {
    return "Failed";
  }

  if (
    cleanStatus.includes("refund")
  ) {
    return "Refunded";
  }

  return status;
}

function displayorder() {

  orderdisplay.innerHTML = "";

  orders.forEach(order => {

    const method = String(
      order.processingMethod || ""
    ).toLowerCase().trim();

    let queueName = "";

    if (
      method.includes("fast") ||
      method.includes("priority")
    ) {
      queueName = "Fast Lane";
    }

    if (
      method.includes("standard") ||
      method.includes("normal")
    ) {
      queueName = "Standard Queue";
    }

    // Only show queue when a queue has actually been assigned
    let queueHTML = "";

    if (queueName) {

      queueHTML = `
        <div class="my-queue">
          <span>${queueName}</span>
        </div>
      `;

    }

    orderdisplay.innerHTML += `

      <div class="order">

        <h2>MTN: ${order.amount}</h2>

        <p>Recipient: ${order.num}</p>

        <p>Price: GHS ${order.price}</p>

        <p>Data: ${order.date}</p>

        <p class="status">
          Status: ${formatStatus(order.status)}
        </p>

        ${queueHTML}

      </div>

    `;

  });

}


displayorder();


// ==========================================

// ==========================================
// UPDATE ONE ORDER STATUS
// ==========================================

async function updateOrderStatus(order) {

  if (!order.dataMartReference) {

    console.log(
      "No DataMart reference for order:",
      order
    );

    return;
  }


  try {

    const response = await fetch(
      `${BACKEND_URL}/order-status/${encodeURIComponent(
        order.dataMartReference
      )}`
    );


    const result =
      await response.json();


    console.log(
      "DataMart order status:",
      result
    );

if (
  result.status === "success" &&
  result.data
) {

  const newStatus =
    result.data.orderStatus ||
    result.data.status ||
    result.data.order_status;


const newProcessingMethod =
  result.data.processingMethod ||
  result.data.processing_method ||
  result.data.processingMethodName ||
  result.data.method ||
  result.data.queue ||
  result.data.lane;

  console.log(
    "Actual DataMart status:",
    newStatus
  );


  console.log(
    "Actual DataMart processing method:",
    newProcessingMethod
  );


  if (newStatus) {

    order.status =
      newStatus;

  }


  if (newProcessingMethod) {

    order.processingMethod =
      newProcessingMethod;

  }


  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );


  displayorder();

}
    

  } catch (error) {

    console.error(
      "Order status error:",
      error
    );

  }

}


// ==========================================
// UPDATE ALL ORDERS
// ==========================================

async function updateAllOrderStatuses() {

  for (const order of orders) {

    await updateOrderStatus(order);

  }

}


// Check immediately

updateAllOrderStatuses();


// Check every 15 seconds

setInterval(
  updateAllOrderStatuses,
  15000
);
// UPDATE ONE ORDER STATUS

function buybundle() {

  if (!selected) {

    alert(
      "please select a card first"
    );

    return;

  }


  const num =
    document.getElementById("number").value;

  const email =
    document
      .getElementById("email")
      .value
      .trim();


  if (!num || !email) {

    alert(
      "please enter number and email"
    );

    return;

  }


  const confirmpay =
    confirm(
      "are you sure to buy this card"
    );


  if (!confirmpay) {
    return;
  }


  console.log(
    "Purchase button clicked"
  );

  console.log(
    "Product:",
    selected
  );

  console.log(
    "Phone:",
    num
  );


  const amountinpessewas =
    selected.price * 100;


  const paystack =
    new PaystackPop();


  paystack.newTransaction({

    key:
      "pk_live_451de0b07e5f1d06b51823b071428b1bcd4d2245",

    email:
      email,

    amount:
      amountinpessewas,

    currency:
      "GHS",

    phone:
      num,

    metadata: {

      network:
        "MTN",

      bundle:
        selected.amount,

      recipient:
        num

    },


    onSuccess:
      async (transaction) => {

        console.log(
          "Paystack payment completed"
        );

        console.log(
          "Reference:",
          transaction.reference
        );


        try {

          const response =
            await fetch(
              `${BACKEND_URL}/verify-payment/${transaction.reference}`
            );


          const result =
            await response.json();


          console.log(
            "Verification result:",
            result
          );


          if (result.success) {

            console.log(
              "Payment verified by backend"
            );


            const now =
              new Date();


            // ==================================
            // CREATE ORDER
            // ==================================

            const neworder = {

              amount:
                selected.amount,

              price:
                selected.price,

              num:
                num,

              date:
                now.toLocaleDateString(),

              // Initial status
              status:
                "processing",

              // Paystack reference
              reference:
                transaction.reference,

              // DataMart order reference
              dataMartReference:
                result.dataMartReference,

              // Fast or standard
              processingMethod:
  result.processingMethod || ""

            };


            // Save order

            orders.push(
              neworder
            );


            localStorage.setItem(
              "orders",
              JSON.stringify(orders)
            );


            // Show orders page

            show("orders");


            displayorder();
            // Immediately check DataMart


            
            updateOrderStatus(
              neworder
            );


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

              JSON.stringify(
                result.details
              )

            );

          }


        } catch (error) {

          console.error(
            "Verification error:",
            error
          );


          alert(

            "Payment was completed, but we could not contact the verification server."

          );

        }

      }

  });

}


// ==========================================
// NAVIGATION BUTTONS
// ==========================================

const btns =
  document.querySelectorAll(
    ".nav-btns .btn"
  );


btns.forEach(btn => {

  btn.addEventListener(
    "click",
    function() {

      btns.forEach(button => {

        button.classList.remove(
          "hover"
        );

      });


      btn.classList.add(
        "hover"
      );

    }
  );

});


// ==========================================
// MAIN PAGE DELIVERY TRACKER
// ==========================================

async function loadDeliveryTracker() {

  try {

    const response =
      await fetch(
        `${BACKEND_URL}/delivery-tracker`
      );


    const result =
      await response.json();


    console.log(
      "Delivery tracker:",
      result
    );


    if (
      result.status !== "success"
    ) {
      return;
    }


    const checkingNow =
      document.getElementById(
        "checkingNow"
      );


    if (checkingNow) {

      const summary =
        result.data?.checkingNow?.summary;


      if (summary) {

        const match =
          summary.match(
            /Batch #(\S+)/
          );


        checkingNow.textContent =
          match
            ? "#" + match[1]
            : summary;

      } else {

        checkingNow.textContent =
          "—";

      }

    }


  } catch (error) {

    console.error(
      "Delivery tracker error:",
      error
    );

  }

}


// Load immediately

loadDeliveryTracker();


// Refresh every 15 seconds

setInterval(
  loadDeliveryTracker,
  15000
);
