const header = document.querySelector("header");
const form = document.getElementById("contact-form");
const success = document.getElementById("feedback-success");
const error = document.getElementById("feedback-error");
const submitBtn = form.querySelector("button[type='submit']");
const ajaxPageLinks = document.querySelectorAll(".ajax-page");
const submenuLinks = document.querySelectorAll("li.submenu-nav");
const main = document.getElementById("main");

const homeLinks = document.querySelectorAll(".home-link");

if (IntersectionObserver !== undefined) {
  const cards = main.querySelectorAll(".grid-items .item");

  cards.forEach(element => {
    const oberver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add("visible");
        }
      },
      {
        threshold: 0.2,
      }
    );
    oberver.observe(element);
  });
}

function handleScroll() {
  if (window.scrollY > 100) {
    header.classList.add("small");
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

function fetchPage(url) {
  main.innerHTML = "<h2 style='margin:30px;text-align:center;'>Please wait...</h2>";

  fetch(url)
    .then(function (res) {
      return res.text();
    })
    .then(function (html) {
      localStorage.setItem("last_url", url);
      main.innerHTML = html;
      setUpCarousal();
    })
    .catch(function () {
      main.innerHTML = "<h2>Error loading page...</h2>";
    });
}

homeLinks.forEach(a => {
  a.addEventListener("click", () => {
    localStorage.removeItem("last_url");
  });
});

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
      .then(response => {
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
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Send Message";
        error.style.display = "block";
      });
  }
};

submenuLinks.forEach(function (listItem) {
  const submenu = listItem.querySelector("ul.submenu");

  listItem.onmouseenter = function () {
    submenu.classList.add("active");
  };

  listItem.onmouseleave = function () {
    submenu.classList.remove("active");
  };
});

ajaxPageLinks.forEach(function (link) {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const submenu = link.closest(".submenu");

    if (submenu) {
      submenu.classList.remove("active");
    }

    fetchPage(link.href);
  });
});

function setUpCarousal() {
  const carousalItem = document.getElementById("carousal-item");
  const carousalImages = document.querySelectorAll("#carousal-images img");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const imageCount = document.getElementById("imageCount");

  let count = carousalImages.length;
  let currentIndex = 0;

  function showImage(img, animName) {
    // Create or replace current image
    if (!img) return;

    const imageElement = document.createElement("img");

    imageElement.src = img.getAttribute("data-src");
    imageElement.className = "active-carousal-image";
    imageElement.style.animationName = animName;
    carousalItem.style.minHeight = imageElement.height;

    carousalItem.innerHTML = "";
    carousalItem.appendChild(imageElement);

    imageCount.innerHTML = `${currentIndex + 1} / ${count}`;

    if (currentIndex == count - 1) {
      next.disabled = true;
    } else {
      next.disabled = false;
    }

    if (currentIndex == 0) {
      prev.disabled = true;
    } else {
      prev.disabled = false;
    }
  }

  function handleBackPressed() {
    if (currentIndex === 0) return;

    currentIndex = Math.max(currentIndex - 1, 0);
    const currentImage = carousalImages[currentIndex];
    showImage(currentImage, "slideInLeft");
  }

  function handleNextPressed() {
    if (currentIndex + 1 === count) return;

    currentIndex = Math.min(currentIndex + 1, count);

    const currentImage = carousalImages[currentIndex];
    showImage(currentImage, "slideInRight");
  }

  function handleKeyDown(e) {
    if (e.keyCode === 39) {
      return handleNextPressed();
    }

    if (e.keyCode === 37) {
      return handleBackPressed();
    }
  }

  if (carousalItem && carousalImages) {
    const currentImage = carousalImages[currentIndex];
    showImage(currentImage);

    prev.addEventListener("click", handleBackPressed);
    next.addEventListener("click", handleNextPressed);

    // Keyboard support
    window.addEventListener("keydown", handleKeyDown);
  }
}

window.addEventListener("scroll", debounce(handleScroll, 300));

// Load initialPage
const url = localStorage.getItem("last_url");
if (url && url.startsWith("http")) {
  fetchPage(url);
}
