// const mobileLink =
//   "https://altmshfkgudtjr.github.io/react-epub-viewer/files/Alices%20Adventures%20in%20Wonderland.epub";
const mobileLink =
  "https://dl.dropboxusercontent.com/s/btfs6juiqs4fvee/Before-Quit-Teach-9781948244244.epub?dl=1";

const next = document.getElementById("next");
const prev = document.getElementById("prev");
const slider = document.getElementById("current-percent");
const percentEle = document.getElementById("percent");
const Chapter = document.getElementById("chapter");

let slide = function () {
  let cfi = book.locations.cfiFromPercentage(slider.value / 100);
  rendition.display(cfi);
};
let mouseDown = false;

(function () {
  const toggleMenu = function () {
    if (window.innerWidth > 0) {
      $(".toc-list").slideToggle(250);
    }
  };
  const collapseMenu = function () {
    if (window.innerWidth > 0) {
      $(".toc-list").slideUp(250);
    }
  };
  document.querySelector("#toc-toggle").addEventListener("click", toggleMenu);
  document.querySelector("#cur-chapter").addEventListener("click", toggleMenu);
  $(".toc-list a").click(collapseMenu);
  document.addEventListener("click", function (event) {
    if (
      $(event.target).closest("#toc-toggle").length === 0 &&
      $(event.target).closest("#cur-chapter").length === 0
    ) {
      collapseMenu();
    }
  });

  var handleMatchMedia = function (md) {
    if (md.matches) {
      $(".toc-list").show();
    } else {
      $(".toc-list").hide();
    }
  };
  var mq = window.matchMedia("(min-width: " + "px)");
  handleMatchMedia(mq);
  mq.addEventListener("change", handleMatchMedia);
})();

var book = ePub(mobileLink);
var rendition = book.renderTo("area", {
  method: "default",
  flow: "auto",
  width: "100%",
  height: "100%",
  spread: "always",
});
var displayed = rendition.display();
next.addEventListener(
  "click",
  function (e) {
    rendition.next();
    e.preventDefault();
  },
  false
);
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

    displayed.then(function () {
      // Get the current CFI
      var currentLocation = rendition.currentLocation();
      // Get the Percentage (or location) from that CFI
      console.log(book.locations);
      console.log(currentLocation);

      var currentPage = book.locations.percentageFromCfi(
        currentLocation.start.cfi
      );
      slider.value = currentPage;
      var percentage = Math.floor(currentPage * 100);
      percentEle.innerHTML = `${percentage}%`;
    });

    rendition.on("rendered", function (section) {
      let currSection = section.href;
      if (currSection) {
        currNav = book.navigation.get(currSection);
        if (currNav) {
          currLabel = currNav.label;
        } else {
          currLabel = "contents";
        }
        Chapter.textContent = currLabel;
      }
    });

    rendition.on("relocated", function (location) {
      var percent = book.locations.percentageFromCfi(location.start.cfi);
      var percentage = Math.floor(percent * 100);
      if (!mouseDown) {
        slider.value = percentage;
      }
      percentEle.innerHTML = `${percentage}%`;
      console.log(percentage);
      if (location.atEnd) {
        next.style.visibility = "hidden";
      } else {
        next.style.visibility = "visible";
      }
      if (location.atStart) {
        prev.style.visibility = "hidden";
      } else {
        prev.style.visibility = "visible";
      }
    });

    // Save out the generated locations to JSON
    localStorage.setItem(book.key() + "-locations", book.locations.save());
  });

book.loaded.navigation.then(function (toc) {
  var $nav = document.getElementById("toc"),
    docfrag = document.createDocumentFragment();
  var addTocItems = function (parent, tocItems) {
    var $ul = document.createElement("ul");
    tocItems.forEach(function (chapter) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.textContent = chapter.label;
      link.href = chapter.href;
      item.appendChild(link);
      if (chapter.subitems) {
        addTocItems(item, chapter.subitems);
      }
      link.onclick = function () {
        var url = link.getAttribute("href");
        rendition.display(url);
        return false;
      };
      $ul.appendChild(item);
    });
    parent.appendChild($ul);
  };
  addTocItems(docfrag, toc);
  $nav.appendChild(docfrag);
  if ($nav.offsetHeight + 60 < window.innerHeight) {
    $nav.classList.add("fixed");
  }
});

book.loaded.metadata.then(function (meta) {
  var titleElm = document.getElementById("book-title");
  var authorElm = document.getElementById("book-author");
  var coverElm = document.getElementById("cover");
  titleElm.textContent = meta.title;
  authorElm.textContent = meta.creator;
  book.coverUrl().then((url) => {
    coverElm.src = url;
    console.log(url);
  });
  // if (book.archive) {
  //   book.archive.createUrl(book.cover).then(function (url) {
  //     coverElm.src = url;
  //     console.log(url);
  //   });
  // } else {
  //   coverElm.src = book.cover;
  //   console.log(book.cover);
  // }
  // console.log("cover", coverElm.src);
});

// (function () {
//   const toggleMenu = function () {
//     if (window.innerWidth > 0) {
//       $(".toc-list").slideToggle(250);
//     }
//   };
//   const collapseMenu = function () {
//     if (window.innerWidth > 0) {
//       $(".toc-list").slideUp(250);
//     }
//   };
//   document.querySelector("#toc-toggle").addEventListener("click", toggleMenu);
//   document.querySelector("#cur-chapter").addEventListener("click", toggleMenu);
//   $(".toc-list a").click(collapseMenu);
//   document.addEventListener("click", function (event) {
//     if (
//       $(event.target).closest("#toc-toggle").length === 0 &&
//       $(event.target).closest("#cur-chapter").length === 0
//     ) {
//       collapseMenu();
//     }
//   });
// })();

// $(function () {
//   const toggleMenu = function () {
//     if (window.innerWidth > 0) {
//       $(".toc-list").slideToggle(250);
//     }
//   };
//   const collapseMenu = function () {
//     if (window.innerWidth > 0) {
//       $(".toc-list").slideUp(250);
//     }
//   };
//   document.querySelector("#toc-toggle").addEventListener("click", toggleMenu);
//   document.querySelector("#cur-chapter").addEventListener("click", toggleMenu);
//   $(".toc-list a").click(collapseMenu);
//   document.addEventListener("click", function (event) {
//     if (
//       $(event.target).closest("#toc-toggle").length === 0 &&
//       $(event.target).closest("#cur-chapter").length === 0
//     ) {
//       collapseMenu();
//     }
//   });
//   var handleMatchMedia = function (md) {
//     if (md.matches) {
//       $(".toc-list").show();
//     } else {
//       $(".toc-list").hide();
//     }
//   };
//   var mq = window.matchMedia("(min-width: " + "px)");
//   handleMatchMedia(mq);
//   mq.addEventListener("change", handleMatchMedia);
// });
