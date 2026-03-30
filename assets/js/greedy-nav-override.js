/*
 * Greedy Nav "All or Nothing" override
 *
 * Replaces the default priority-plus (greedy) navigation behaviour with an
 * all-or-nothing approach: when there is not enough room for ALL navigation
 * items they ALL collapse into the hamburger menu; when there is enough room
 * they ALL reappear in the top bar.
 */
$(function () {
  var $btn    = $("nav.greedy-nav .greedy-nav__toggle");
  var $vlinks = $("nav.greedy-nav .visible-links");
  var $hlinks = $("nav.greedy-nav .hidden-links");
  var $nav    = $("nav.greedy-nav");
  var $logo   = $("nav.greedy-nav .site-logo");
  var $title  = $("nav.greedy-nav .site-title");
  var $search = $("nav.greedy-nav button.search__toggle");

  function checkAllOrNothing() {
    // Restore every hidden item back to the visible list so we can measure it.
    while ($hlinks.children().length > 0) {
      $hlinks.children().first().appendTo($vlinks);
    }

    // Space available for nav items (subtract logo, title, search button).
    var availableSpace =
      $nav.innerWidth() -
      ($logo.length  ? $logo.outerWidth(true)   : 0) -
      $title.outerWidth(true) -
      ($search.length ? $search.outerWidth(true) : 0);

    // Total width required by all nav items.
    var totalRequired = 0;
    $vlinks.children().each(function () {
      totalRequired += $(this).outerWidth(true);
    });

    // If items don't fit (accounting for the toggle button width), collapse ALL.
    if (totalRequired > availableSpace - $btn.outerWidth(true)) {
      while ($vlinks.children().length > 0) {
        $vlinks.children().last().prependTo($hlinks);
      }
      $btn.attr("count", $hlinks.children().length).removeClass("hidden");
    } else {
      // All items fit – hide the toggle and ensure the dropdown is closed.
      $btn.attr("count", 0).addClass("hidden");
      $hlinks.addClass("hidden");
    }
  }

  // Replace the greedy nav's resize handler with our all-or-nothing version.
  $(window).off("resize").on("resize", checkAllOrNothing);

  // Re-run once the page (and logo image) is fully loaded for accurate widths.
  $(window).on("load", checkAllOrNothing);

  // Run now.
  checkAllOrNothing();
});
