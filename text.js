var controls = document.getElementById("controls");
var currentPage = document.getElementById("current-percent");
var slider = document.createElement("input");
var slide = function () {
  var cfi = book.locations.cfiFromPercentage(slider.value / 100);
  rendition.display(cfi);
};
var mouseDown = false;

// Load the opf
var book = ePub(
  "https://dl.dropboxusercontent.com/s/btfs6juiqs4fvee/Before-Quit-Teach-9781948244244.epub?dl=1"
);
var rendition = book.renderTo("viewer", {
  width: "100%",
  height: 600,
  spread: "always",
});

var displayed = rendition.display();

var title = document.getElementById("title");

var next = document.getElementById("next");
next.addEventListener(
  "click",
  function (e) {
    rendition.next();
    e.preventDefault();
  },
  false
);

var prev = document.getElementById("prev");
prev.addEventListener(
  "click",
  function (e) {
    rendition.prev();
    e.preventDefault();
  },
  false
);

book.ready
  .then(function () {
    // Load in stored locations from json or local storage
    var key = book.key() + "-locations";
    var stored = localStorage.getItem(key);
    if (stored) {
      return book.locations.load(stored);
    } else {
      // Or generate the locations on the fly
      // Can pass an option number of chars to break sections by
      // default is 150 chars
      return book.locations.generate(1600);
    }
  })
  .then(function (locations) {
    controls.style.display = "block";
    slider.setAttribute("type", "range");
    slider.setAttribute("min", 0);
    slider.setAttribute("max", 100);
    // slider.setAttribute("max", book.locations.total+1);
    slider.setAttribute("step", 1);
    slider.setAttribute("value", 0);

    slider.addEventListener("change", slide, false);
    slider.addEventListener(
      "mousedown",
      function () {
        mouseDown = true;
      },
      false
    );
    slider.addEventListener(
      "mouseup",
      function () {
        mouseDown = false;
      },
      false
    );

    // Wait for book to be rendered to get current page
    displayed.then(function () {
      // Get the current CFI
	    var currentLocation = rendition.currentLocation();
      console.log(book.locations);
      console.log(currentLocation);
	    
      // Get the Percentage (or location) from that CFI
      var currentPage = book.locations.percentageFromCfi(
        currentLocation.start.cfi
      );
      slider.value = currentPage;
      console.log(currentPage);
      currentPage.value = currentPage;
    });

    controls.appendChild(slider);

    currentPage.addEventListener(
      "change",
      function () {
        var cfi = book.locations.cfiFromPercentage(currentPage.value / 100);
        rendition.display(cfi);
      },
      false
    );

    // Listen for location changed event, get percentage from CFI
    rendition.on("relocated", function (location) {
      var percent = book.locations.percentageFromCfi(location.start.cfi);
      var percentage = Math.floor(percent * 100);
      if (!mouseDown) {
        slider.value = percentage;
      }
      currentPage.value = percentage;
      console.log(percentage);
      console.log(location);
    });

    // Save out the generated locations to JSON
    localStorage.setItem(book.key() + "-locations", book.locations.save());
  });
