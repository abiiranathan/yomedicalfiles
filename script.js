const header = document.querySelector("header");
const form = document.getElementById("contact-form");
const success = document.getElementById("feedback-success");
const error = document.getElementById("feedback-error");
const submitBtn = form.querySelector("button[type='submit']");

if (IntersectionObserver !== undefined) {
  const main = document.getElementById("main");
  const cards = main.querySelectorAll(".grid-items .item");

  cards.forEach((element) => {
    const oberver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add("visible");
        }
      },
      {
        threshold: 0.5,
      }
    );
    oberver.observe(element);
  });
}

function handleScroll() {
  if (window.scrollY > 60) {
    header.classList.add("small");
  } else {
    header.classList.remove("small");
  }
}

function debounce(fn, ms) {
  let timeoutId;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn.apply(args), ms);
  };
}

function isValidEmail(email) {
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return pattern.test(email);
}

form.onsubmit = function (e) {
  e.preventDefault();

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const message = document.getElementById("message");

  const errorElement = document.querySelector(".form-error");

  if (!isValidEmail(email.value)) {
    if (errorElement) {
      errorElement.remove();
    }

    document
      .getElementById("email")
      .insertAdjacentHTML(
        "afterend",
        "<p style='color: red; margin:10px 0;' class='form-error'>Enter a valid email</p>"
      );
    return;
  }

  if (errorElement) {
    errorElement.remove();
  }

  if (name.value && email.value && message.value) {
    const payload = {
      name: name.value,
      email: email.value,
      message: message.value,
    };

    success.style.display = "none";
    error.style.display = "none";

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending message...";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch("https://mfymailer.herokuapp.com/", {
      signal: controller.signal,
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "X-RequestedWith": "XmlHttpRequest",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (response.status === 200) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(() => {
        success.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Message";
        name.value = "";
        email.value = "";
        message.value = "";
      })
      .catch((err) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Message";
        error.style.display = "block";
      });
  }
};

window.addEventListener("scroll", debounce(handleScroll, 300));
