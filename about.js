// =====================================================
// ABOUT SECTION ANIMATION
// =====================================================

const aboutSection =
    document.querySelector(".about-section");


const aboutCards =
    document.querySelectorAll(
        ".about-point, .about-stat"
    );


const aboutObserver =
    new IntersectionObserver(
        function(entries) {

            entries.forEach(function(entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "about-visible"
                    );

                }

            });

        },
        {
            threshold: 0.15
        }
    );


aboutCards.forEach(function(card) {

    aboutObserver.observe(card);

});