window.addEventListener("scroll", function () {
  var header = document.querySelector("header");
  var scrolled = window.scrollY;

  if (scrolled > 50) {
    header.classList.add("transparent");
  } else {
    header.classList.remove("transparent");
  }

  var banner = document.getElementById("banner");
  var scrolled = window.scrollY;

  // Efek parallax untuk image
  banner.style.transform = "translateY(" + scrolled * 0.3 + "px)";
});

function getPageList(totalPages, page, maxLength) {
  function range(start, end) {
    return Array.from(Array(end - start + 1), (_, i) => i + start);
  }

  var sideWidth = maxLength < 9 ? 1 : 2;
  var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
  var rightWidth = (maxLength - sideWidth * 2 - 3) >> 1;

  if (totalPages <= maxLength) {
    return range(1, totalPages);
  }
  if (page <= maxLength - sideWidth - 1 - rightWidth) {
    return range(1, maxLength - sideWidth - 1).concat(
      0,
      range(totalPages - sideWidth + 1, totalPages)
    );
  }
  if (page >= maxLength - sideWidth - 1 - rightWidth) {
    return range(1, sideWidth).concat(
      0,
      range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
    );
  }
  return range(1, sideWidth).concat(
    0,
    range(page - leftWidth, page + rightWidth),
    0,
    range(totalPages - sideWidth + 1, totalPages)
  );
}

$(function () {
  var numberOfItems = $(".card-content .card").length;
  var limitPerPage = 8;
  var totalPages = Math.ceil(numberOfItems / limitPerPage);
  var paginationSize = 7;
  var currentPage;
  var sortOrder = "newest";

  function parseCustomDate(dateString) {
    // Convert "5 September 2022" to a format that Date can parse, e.g., "2022-09-05"
    const parts = dateString.split(" ");
    const monthNames = [
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
    const month = monthNames.indexOf(parts[1]) + 1; // Month index starts from 0
    const day = parseInt(parts[0]);
    const year = parseInt(parts[2]);

    // Ensure two-digit day and month
    const formattedMonth = month < 10 ? "0" + month : month.toString();
    const formattedDay = day < 10 ? "0" + day : day.toString();

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  function showPage(whichPage) {
    if (whichPage < 1 || whichPage > totalPages) return false;

    currentPage = whichPage;
    limitPerPage = parseInt($("#itemsPerPageDropdown").val());
    sortOrder = $("#sortByDropdown").val();

    // Sorting logic
    var $cards = $(".card-content .card");
    if (sortOrder === "newest") {
      $cards.sort(function (a, b) {
        return (
          new Date(parseCustomDate($(b).find(".card-date").text())) -
          new Date(parseCustomDate($(a).find(".card-date").text()))
        );
      });
    } else if (sortOrder === "oldest") {
      $cards.sort(function (a, b) {
        return (
          new Date(parseCustomDate($(a).find(".card-date").text())) -
          new Date(parseCustomDate($(b).find(".card-date").text()))
        );
      });
    }

    var startIndex = (currentPage - 1) * limitPerPage;
    var endIndex = Math.min(startIndex + limitPerPage, numberOfItems);

    $(".card-content .card").hide().slice(startIndex, endIndex).show();

    $(".pagination li").slice(1, -1).remove();

    getPageList(totalPages, currentPage, paginationSize).forEach((item) => {
      $("<li>")
        .addClass("page-item")
        .addClass(item ? "current-page" : "dots")
        .toggleClass("active", item === currentPage)
        .append(
          $("<a>")
            .addClass("page-link")
            .attr({ href: "javascript:void(0)" })
            .text(item || "...")
        )
        .insertBefore(".next-page");
    });

    // Update the pagination info
    $("#startPage").text(startIndex + 1);
    $("#endPage").text(endIndex);
    $("#totalPages").text(numberOfItems);

    $(".previous-page").toggleClass("disable", currentPage === 1);
    $(".next-page").toggleClass("disable", currentPage === totalPages);
    saveStateToLocalStorage();
    return true;
  }

  function saveStateToLocalStorage() {
    localStorage.setItem('currentPage', currentPage);
    localStorage.setItem('limitPerPage', limitPerPage);
    localStorage.setItem('sortOrder', sortOrder);
    }

    function loadStateFromLocalStorage() {
        currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
        limitPerPage = parseInt(localStorage.getItem('limitPerPage')) || 8;
        sortOrder = localStorage.getItem('sortOrder') || 'newest';

        // Update your UI based on the loaded state
        $("#itemsPerPageDropdown").val(limitPerPage);
        $("#sortByDropdown").val(sortOrder);
    }

    loadStateFromLocalStorage();

  $("#itemsPerPageDropdown").on("change", function () {
    limitPerPage = parseInt($(this).val());
    totalPages = Math.ceil(numberOfItems / limitPerPage);
    showPage(1);
  });

  $(".pagination").append(
    $("<li>")
      .addClass("page-item")
      .addClass("previous-page")
      .append(
        $("<a>")
          .addClass("page-link")
          .attr({ href: "javascript:void(0)" })
          .text("Prev")
      ),
    $("<li>")
      .addClass("page-item")
      .addClass("next-page")
      .append(
        $("<a>")
          .addClass("page-link")
          .attr({ href: "javascript:void(0)" })
          .text("Next")
      )
  );

  $(".card-content").show();
  showPage(1);

  $("#sortByDropdown").on("change", function () {
    sortOrder = $(this).val();
    showPage(currentPage);
  });

  $(document).on(
    "click",
    ".pagination li.current-page:not(.active)",
    function () {
      return showPage(+$(this).text());
    }
  );
});
