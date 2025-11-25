 console.log("header.js loaded");
 $(document).ready(function() {
            // Scroll Effect
            $(window).scroll(function() {
                if ($(this).scrollTop() > 20) {
                    $('#header-wrapper').addClass('scrolled');
                } else {
                    $('#header-wrapper').removeClass('scrolled');
                }
            });

            // Search Toggle
            $('#search-toggle').click(function(e) {
                e.preventDefault();
                $('#search-drawer').slideToggle(300, function() {
                    // Focus input when opened
                    if ($(this).is(':visible')) {
                        $('#search-input').focus();
                    }
                });
            });
            
            // Close search when clicking outside (optional UX improvement)
            $(document).mouseup(function(e) {
                var container = $("#search-drawer");
                var button = $("#search-toggle");
                
                // If the target of the click isn't the container nor a descendant of the container
                // And not the toggle button itself
                if (!container.is(e.target) && container.has(e.target).length === 0 && 
                    !button.is(e.target) && button.has(e.target).length === 0) {
                    if (container.is(':visible')) {
                        container.slideUp(300);
                    }
                }
            });
        });