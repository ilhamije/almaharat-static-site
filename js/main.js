var GLOBAL = {};
GLOBAL.DotNetReference = null;
function setDotnetReference(pDotNetReference) {
    GLOBAL.DotNetReference = pDotNetReference;
}

window.addEventListener('resize', function () {
    var w = window.innerWidth;
    try {
        GLOBAL.DotNetReference.invokeMethodAsync('OnScreenSizeChange', w);
        if (w < 1200) {
            GLOBAL.DotNetReference.invokeMethodAsync('OnWindowResized', true);
        } else {
            GLOBAL.DotNetReference.invokeMethodAsync('OnWindowResized', false);
        }

    } catch (e) {

    }


});
function getIsMobile() {
    var w = window.innerWidth;
    if (w < 1200) {
        return true;
    } else {
        return false;
    }
}

function playVideoById(vidId, vidSource) {
    try {
        var video = document.getElementById(vidId);
        while (video.firstChild) {
            video.removeChild(video.lastChild);
        }
        var source = document.createElement('source');
        source.setAttribute('src', vidSource);
        source.setAttribute('type', 'video/mp4');
        video.appendChild(source);
        video.load();
        console.log(vidId);
        video.muted = "muted";
        playVid(video, "enter", vidId)
    } catch (e) {
        //console.log(e)
    }

}
function playVid(video, event, vidId) {
    video.play();
}
function pauseVid(video, event, vidId) {
    video.pause();
}
function getBrowserLanguage() {
    var res = navigator.language || navigator.userLanguage;
    return res;
}
function initializeCarousel(selector, optionsJson) { var options = JSON.parse(optionsJson); $(selector).owlCarousel(options); }

window.setupMenuClickHandler = (dotNetHelper) => {
    document.addEventListener('click', function (event) {
        const burgerMenu = document.querySelector('.burger-menu');
        const burgerToggle = document.querySelector('.burger-menu-toggle');

        if (!burgerMenu.contains(event.target) && !burgerToggle.contains(event.target)) {
            dotNetHelper.invokeMethodAsync('HandleDocumentClick');
        }
    });
};
window.registerStickyHeader = (dotNetHelper, headerElement) => {
    const headerHeight = headerElement.offsetHeight;
    let lastScrollPosition = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollPosition = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                dotNetHelper.invokeMethodAsync('OnScroll', lastScrollPosition > 10);
                ticking = false;
            });
            ticking = true;
        }
    });
};


// wwwroot/js/menu.js
window.megaMenu = {
    init: function (dotNetHelper, menuContainer) {
        if (!menuContainer) return;

        const header = menuContainer.closest('.sticky-header');

        const updateScrolledState = () => {
            const isScrolled = window.scrollY > 10;

            if (header) {
                if (isScrolled) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }

            dotNetHelper.invokeMethodAsync('SetScrolled', isScrolled);
        };

        updateScrolledState();

        window.addEventListener('scroll', updateScrolledState, { passive: true });

        document.addEventListener('click', function (e) {
            if (!menuContainer.contains(e.target)) {
                dotNetHelper.invokeMethodAsync('HandleDocumentClick');
            }
        });

        menuContainer.addEventListener('mouseleave', function () {
            dotNetHelper.invokeMethodAsync('HandleDocumentClick');
        });
    }
};

window.OwlCarouselInterop = {
    initializeCarousel:
        function (selector, optionsJson) {
            //try {
            //    var $carousel = $(selector);

            //    // 2. Check if Owl Carousel is initialized
            //    var owlData = $carousel.data('owl.carousel');

            //    if (owlData) {
            //        // 3. Properly destroy the instance
            //        $carousel.trigger('destroy.owl.carousel').removeClass('owl-loaded owl-hidden');

            //        // 4. Manually clean up Owl's DOM changes
            //        $carousel.find('.owl-stage-outer').children().unwrap();
            //        $carousel.find('.owl-nav').remove();
            //        $carousel.find('.owl-dots').remove();

            //        // 5. Remove all Owl-related classes
            //        $carousel.removeClass(function (index, className) {
            //            return (className.match(/(^|\s)owl-\S+/g) || []).join(' ');
            //        });

            //        // 6. Force remove data (in case destroy didn't clear it)
            //        $carousel.removeData('owl.carousel');
            //    }
            //} catch (e) {
            //    console.log(e);
            //}
            try {
                var options = JSON.parse(optionsJson);
                $(selector).owlCarousel(options);
                //alert('Here')
            } catch (e) {
                console.log(e)
                alert('error')
            }
            
            
        }
};



// Note: No exports, just add to window
window.CartAnimator = {
    animate: function (sourceId, targetId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        if (!source || !target) return;

        const clone = source.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 0.6s ease-out';

        const startRect = source.getBoundingClientRect();
        const endRect = target.getBoundingClientRect();

        clone.style.left = `${startRect.left}px`;
        clone.style.top = `${startRect.top}px`;
        clone.style.width = `${startRect.width}px`;
        clone.style.height = `${startRect.height}px`;

        document.body.appendChild(clone);

        setTimeout(() => {
            clone.style.left = `${endRect.left}px`;
            clone.style.top = `${endRect.top}px`;
            clone.style.width = '20px';
            clone.style.height = '20px';
            clone.style.opacity = '0.5';
        }, 20);

        setTimeout(() => clone.remove(), 500);
    }
};


window.ysObserveFadeElement = (element) => {
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                element.classList.add("ys-visible");
                element.classList.remove("ys-hidden");
            } else {
                element.classList.remove("ys-visible");
                element.classList.add("ys-hidden");
            }
        });
    }, {
        threshold: 0.08
    });

    observer.observe(element);
};