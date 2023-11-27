(function ($) {

  var exports = {};

  var options = {};

  var mobileMedia;

  var aos = function () {
    $mobile = ($('body').attr('data-aos-mobile') == 'true') ? false : 'mobile';

    AOS.init({
      easing: 'ease-in-out-sine',
      disable: $mobile,
    });
  };

  var accordion = function () {
    var $accordions = $('.accordion-item');
    $('.accordion-title').on('click', function () {
      var $accordionItem = $(this).closest('.accordion-item');
      $accordions.not($accordionItem).filter('.is-open').removeClass('is-open').find('.accordion-content').slideUp();
      $accordionItem.toggleClass('is-open').find('.accordion-content').slideToggle();
    });
  };

  var autogrow = function () {
    autosize($('.autogrow'));
  };

  var card = function () {
    $('.card-open').on('click', function (e) {
      e.preventDefault();
      $(this).closest('.card').toggleClass('is-active');
    });
  };

  var charNum = function () {
    $('.question-content').each(function (i, obj) {
      var $questionContent = $(this);
      var $countInputs = $(this).find('.textarea');
      $countInputs.each(function () {
        var $thisCountInput = $(this);
        var text_max = $thisCountInput.attr('maxlength');
        var exercicioId = $thisCountInput.data('exercicio-textarea');
        var $feedbackReadout = $questionContent.find('.charNum');

        if ($feedbackReadout.length > 1) {
          $feedbackReadout = $feedbackReadout.filter(`[data-exercicio-id="${exercicioId}"]`);
        }

        $thisCountInput.keyup(function () {
          var text_length = $thisCountInput.val().length;
          var text_remaining = text_max - text_length;
          $feedbackReadout.html(text_remaining);
        }).keyup();
      })

    });
  };



  var drag = function () {
    $('.draggable').draggable();

    $('.droppable').each(function () {
      var limit = parseInt($(this).data('limit'));
      $(this).droppable({
        accept: '.' + $(this).data('accept'),
        drop: function (event, ui) {
          var $droppable = $(this);
          var $dropped = $(ui.helper).clone().removeAttr('style').removeClass().addClass('dropped');
          $dropped.on('click', function () {
            $dropped.remove()
            $(ui.draggable).draggable('option', 'disabled', false);
            $droppable.droppable('option', 'disabled', false);
          })
          if ($dropped.data('drop')) {
            $droppable.append($dropped);
            $(ui.draggable).removeAttr('style').draggable('option', 'disabled', true);
          }
          if ($dropped.data('drag-stop')) {
            $(ui.draggable).draggable('option', 'disabled', true);
          }
          if (limit == $(this).children().length) {
            $droppable.droppable('option', 'disabled', true);
          }
          $dropped.trigger('drop-append');
        }
      });
    });
  };

  var dropdown = function () {
    $('.dropdown-open').on('click', function () {
      $(this).parent().toggleClass('is-active').find('.dropdown-content').slideToggle();
      return false;
    });
  };

  var interactive = function () {
    $('.interactive').each(function () {
      var $interactiveImage = $(this);
      var $interactiveContents = $interactiveImage.find('.interactive-content');
      var $interactiveBtns = $interactiveImage.find('.interactive-btn');

      $interactiveBtns.on('click', function (e) {
        $(this).toggleClass('is-active');
        var $interactiveContentActive = $interactiveImage.find('.' + $(this).data('content'));
        $interactiveContentActive.toggleClass('is-active');
        if ($(this).hasClass('interactive-unique')) {
          $interactiveBtns.not(this).removeClass('is-active');
          $interactiveContents.not($interactiveContentActive).removeClass('is-active');
        }
      });
      $('.interactive-btn-close-content').on('click', function (e) {
        var contentId = $(this).closest('.interactive-content').data('content-id');
        $('.interactive-btn-' + contentId).removeClass('is-active');
        $(this).closest('.interactive-content').removeClass('is-active');
      });
    });
  };

  var scrollElem = function (elem) {
    $('html,body').animate({
      scrollTop: $(elem).offset().top
    }, 700, 'swing');
  };

  var menu = function () {
    $('.menu-btn').on('click', function (e) {
      e.preventDefault();
      $(this).closest('.menu').toggleClass('is-open');
    });

    $('.menu-link').on('click', function (e) {
      $(this).closest('.menu').removeClass('is-open');
    });

    $('.section-link').on('click', function (e) {
      e.preventDefault();
      var section = $(this).data('section') ? '#' + $(this).data('section') : this.hash;
      if (!$.scrollify.isDisabled()) {
        $.scrollify.move(section);
      } else {
        section = parseInt(section.replace('#', ''));
        scrollElem($('.section').eq(section - 1));
      }
    });
  };

  var panel = function () {

    $('.panel-open').on('click', function (e) {
      e.preventDefault();
      var id = $(this).data('panel-id') || 0;
      if (id) {
        $(this).closest('.panel-content').find('.panel').filter('[data-id="' + id + '"]').toggleClass('is-active');
      } else {
        $(this).closest('.panel-content').find('.panel').toggleClass('is-active');
      }
    });

    $('.panel-close').on('click', function (e) {
      e.preventDefault();
      $(this).closest('.panel').removeClass('is-active');
    });

  };

  var scrollSnap = function () {

    function checkScrollify() {
      if (Modernizr.mq('(max-width : 1023px), (max-width : 1024px) and (orientation: portrait)') || $(window).height() < 768) {
        $.scrollify.disable();
      } else {
        $.scrollify.enable();
      }
    }

    function setProgress() {
      if (Modernizr.mq('(max-width : 1023px), (max-width : 1024px) and (orientation: portrait)') || $(window).height() < 768) {
        var value = $(document).scrollTop() * 100 / $(document).height();
        if ($(document).scrollTop() + $('body').height() == $(document).height()) {
          value = 100;
        }
        $progressBar.css('width', value + '%');
      }
    }

    if ($('.full-height').length) {

      options.timeoutResize = 0;
      options.timeoutScroll = 0;

      var sectionLength = $('.full-height .section').length - 1;
      var $progressBar = $('.full-height .progress-bar');

      $.scrollify({
        section: '.full-height .section',
        setHeights: false,
        before: function (index, arrayElem) {
          if (index == sectionLength) {
            $progressBar.css('width', '100%');
          } else {
            $progressBar.css('width', index * 100 / sectionLength + '%');
          }
          $('.menu-item.is-active').removeClass('is-active').addClass('is-viewed');
          $('.menu-link[href="#' + parseInt(index + 1) + '"]').parent('.menu-item').addClass('is-active');
        }
      });

      checkScrollify();

      $(window).on('resize', function () {
        clearTimeout(options.timeoutResize);
        options.timeoutResize = setTimeout(checkScrollify, 50);
      });

      $(window).on('scroll', function () {
        clearTimeout(options.timeoutResize);
        options.timeoutResize = setTimeout(setProgress, 100);
      });


    }

  };

  var slideshow = function () {
    $('.slideshow').each(function () {
      var slidesToShow = $(this).data('slides-show');
      var centerMode = $(this).data('center-mode') ? $(this).data('center-mode') : false;
      var infinite = $(this).data('infinite');
      var dots = true;
      var verticalMode = $(this).data('vertical-mode');
      var play = $(this).data('auto-play');
      var slidesToScroll = $(this).data('slides-scroll');
      var adaptiveHeight = $(this).data('adaptive-height');
      var centerPadding = $(this).data('center-padding');
      var variableWidth = $(this).data('variable-width');
      var initialSlide = $(this).data('initial-slide');
      var mobileSlidesToShow = $(this).data('mobile-slides') || 1;
      var mobileSlidesToScroll = $(this).data('mobile-scroll') || 1;
      var swipe = $(this).data('swipe');
      var mobileSwipe = $(this).data('mobile-swipe');

      var optionsSlick = {
        centerMode: centerMode,
        infinite: infinite,
        vertical: verticalMode,
        slidesToShow: slidesToShow,
        autoplay: play,
        slidesToScroll: slidesToScroll,
        rows: 0,
        adaptiveHeight: adaptiveHeight,
        centerPadding: centerPadding,
        variableWidth: variableWidth,
        initialSlide: initialSlide,
        swipe: swipe,
        responsive: [
          {
            breakpoint: 1023,
            settings: {
              slidesToShow: mobileSlidesToShow,
              slidesToScroll: mobileSlidesToScroll,
              swipe: mobileSwipe,
            }
          }
        ],
        dots: dots ? true : false,
        pauseOnHover: false,
        prevArrow: '<button type="button" class="slideshow-prev">Anterior</button>',
        nextArrow: '<button type="button" class="slideshow-next">Próximo</button>',
        appendArrows: $(this).find('.slideshow-nav')
      };

      var $slideshow = $(this).find('.slideshow-list').slick(optionsSlick);

      var $slideshowNav = $(this).find('.slideshow-nav');
      $slideshowNav.find('.slideshow-nav-total').text($(this).find('.slick-dots li').length);

      if ($slideshowNav.length) {
        $slideshow.on('afterChange', function (event, slick, currentSlide) {
          $slideshowNav.find('.slideshow-nav-current').text($(this).find('.slick-dots .slick-active button').html());
          $slideshowNav.find('.slideshow-nav-total').text($(this).find('.slick-dots li').length);
          $(slick.$slides[currentSlide]).addClass('was-clicked');
          if (parseInt($(slick.$slides).length - 1) === $(slick.$slides).filter('.was-clicked').length) {
            $(this).parent().addClass('was-clicked');
            $(this).closest('.content').next().removeClass('content-disabled');
            AOS.refresh();
            $('.slideshow-list').slick('setPosition');
          }
        });
      }

      var el = $(this).find('.slideshow-caption');
      var elHeight = [];
      el.each(function () {
        elHeight.push($(this).height());
      });

      el.height(Math.max.apply(Math, elHeight));

    });
  };

  var tab = function () {
    $('.tab').each(function () {
      var $tabs = $(this).find('.tab-content-item');
      var $links = $(this).find('.tab-menu-link').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.tab-menu-item').addClass('is-active').siblings().removeClass('is-active');
        $tabs.removeClass('is-active').filter('[data-id="' + $(this).data('tab-id') + '"]').addClass('is-active');
      });
      $links.filter(':first').trigger('click');
    });
  };

  var checkMediaChange = function () {
    const mql = window.matchMedia('(max-width : 1023px), (max-width : 1024px) and (orientation: portrait)');
    mql.addEventListener('change', function (mql) {
      mobileMedia = mql.matches;
      //Aqui pode ir uma lista de funções que dependem desta mudança
      moveTabContent();
    });
    mobileMedia = mql.matches;
  }

  var moveTabContent = function () {
    var $tabs = $('.tab');
    $tabs.each(function () {
      var $tab = $(this);
      var $tabMenuLink = $($tab).find('.tab-menu-link');
      if (mobileMedia) {
        let $tabContent = $($tab).find('.tab-content');
        let $tabContentItem = $tabContent.find('.tab-content-item');
        $tabMenuLink.each(function () {
          let $tabMenuItem = $(this).closest('.tab-menu-item');
          $tabMenuItem.append('<div class="tab-content"></div>');
          $tabMenuItem.find('.tab-content')
            .append($tabContentItem.filter('[data-id="' + $(this).data('tab-id') + '"]'));
        });
      }
      else {
        var $tabContent = $($tab).find('.tab-content').not(function () {
          if ($(this).parent().hasClass('tab-menu-item')) return true;
        });
        $tabMenuLink.each(function () {
          let $tabMenuItem = $(this).closest('.tab-menu-item');
          $tabContent.append($tabMenuItem.find('.tab-content-item'));
          $tabMenuItem.find('.tab-content').remove();
        });
      }
    });
  }

  var timeline = function () {
    var $timelines = $('.timeline-item');
    $('.timeline-title').on('click', function () {
      var $timelineItem = $(this).closest('.timeline-item');
      $timelines.not($timelineItem).filter('.timeline-open').removeClass('timeline-open').find('.timeline-content').slideUp();
      $timelineItem.toggleClass('timeline-open').find('.timeline-content').slideToggle();
      $timelines.removeClass('completed');
      if ($timelineItem.hasClass('timeline-open')) {
        $timelineItem.prevAll().addClass('completed');
      }
    });
  };

  var tooltip = function () {
    $('.tooltip-link').each(function () {
      var $elem = $(this);
      var myPosition = $(this).attr('data-my-position') || 'top center';
      var atPosition = $(this).attr('data-at-position') || 'bottom center';
      var options = {
        content: {
          button: true
        },
        show: {
          event: 'click',
          solo: true
        },
        hide: {
          event: 'click unfocus'
        },
        position: {
          my: myPosition,
          at: atPosition,
          target: $elem,
          viewport: $elem.closest('section')
        },
        style: 'tooltip',
        events: {
          show: function (event, api) {
            $(api.elements.target[0]).addClass('is-active');
          },
          hide: function (event, api) {
            $(api.elements.target[0]).removeClass('is-active');
          }
        }
      };

      var newClass = $(this).data('tooltipClass') || undefined;

      if (newClass) {
        options.style += ' ' + newClass;
      }

      $(this).qtip(options);
    });
  };

  var dragTheHandle = function () {
    $('.drag-the-handle').twentytwenty();
    $('.drag-the-handle-vertical').twentytwenty({
      orientation: 'vertical'
    });
  };

  var IOSfix = function () {
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
      $('html').addClass('ios');
      $.scrollify.disable();
    }
  };

  var plyr = function () {
    var players = Plyr.setup('.plyr-player');

    if (players) {
      players.forEach(function (player) {
        player.on('play', function () {
          var others = players.filter(other => other != player)
          others.forEach(function (other) {
            other.pause();
          })
        });
      });
    }
  };

  var downloadPDF = function () {
    $('.btn-download-pdf').on('click', function () {

      var pdfHeaderTarget = $(this).data('pdf-header-target');
      var $header = $('[data-pdf-header-id=' + pdfHeaderTarget + ']');
      var imgHeader = $header.text().replace('\n', '').trim();
      var headerHeight = Number($header.data('header-height')) || 0;
      var headerWidth = Number($header.data('header-width')) || 210;

      var pdfContentTarget = $(this).data('pdf-content-target');
      var $content = $('[data-pdf-content-id=' + pdfContentTarget + ']');
      var contentWidth = Number($content.data('content-width')) || 150;

      var $pdfAnswers = $content.find('.pdf-answer');

      $pdfAnswers.each(function () {
        var inlineAnswer = $(this).data('inline-answer');
        var pdfAnswerTarget = $(this).data('pdf-answer-target');
        var $pdfAnswerTargetEl = $('[data-pdf-answer-id=' + pdfAnswerTarget + ']');
        var formattedAnswer = $pdfAnswerTargetEl.val().split('\n').map(paragraph => {
          if (paragraph) {
            if (inlineAnswer === true) return ' ' + paragraph;
            return '<p>' + paragraph + '</p>';
          }
        });
        $(this).html(formattedAnswer.join(""));
      });
      var htmlContent = $('[data-pdf-content-id=' + pdfContentTarget + ']').html();

      var pdf = new jsPDF();
      if (pdfHeaderTarget) {
        pdf.addImage(imgHeader, 'JPEG', 0, 0, headerWidth, headerHeight);
      }
      if (pdfContentTarget) {
        pdf.fromHTML(htmlContent, (210 - contentWidth) / 2, headerHeight, { width: contentWidth });
      }
      pdf.save($(this).data('pdf-name'));
    });
  };

  var changeFontSize = function () {
    let htmlSize = $('html').css('font-size');
    let increaseButton = $('.btn-font-size[data-fs-action="increase"]');
    let decreaseButton = $('.btn-font-size[data-fs-action="decrease"]');

    if (parseInt(htmlSize) == 10) {
      $(decreaseButton).attr('disabled', true);
    }

    if (parseInt(htmlSize) == 20) {
      $(increaseButton).attr('disabled', true);
    }

    increaseButton.click(function () {
      htmlSize = parseInt(htmlSize) + 1;

      $('html').css('font-size', htmlSize);

      if (htmlSize == 10) {
        $(decreaseButton).attr('disabled', true);
      } else {
        $(decreaseButton).attr('disabled', false);
      }

      if (htmlSize == 20) {
        $(this).attr('disabled', true);
      }
    });

    decreaseButton.click(function () {
      if (parseInt(htmlSize) >= 11) {
        htmlSize = parseInt(htmlSize) - 1;

        $('html').css('font-size', htmlSize);
      }

      if (parseInt(htmlSize) == 10) {
        $(this).attr('disabled', true);
      }

      if (parseInt(htmlSize) == 20) {
        $(increaseButton).attr('disabled', true);
      } else {
        $(increaseButton).attr('disabled', false);
      }
    });
  };

  var init = function () {
    aos();
    checkMediaChange();
    accordion();
    autogrow();
    card();
    charNum();
    drag();
    dropdown();
    interactive();
    menu();
    panel();
    scrollSnap();
    slideshow();
    tab();
    moveTabContent();
    timeline();
    tooltip();
    dragTheHandle();
    IOSfix();
    plyr();
    downloadPDF();
    changeFontSize();
  }();

  return exports;

})(jQuery);
