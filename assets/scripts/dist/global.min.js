(function ($) {

  var exports = {};

  var options = {
    answers: {},
    requiredBtn: {},
    currentSection: null,
    lastSection: null,
    lastSlide: null,
    activityPoints: null,
    activityPercent: null,
    questionSelect: {},
    videoInt: {},
  };

  var getSuspendData = function () {

    var suspendData = doLMSGetValue('cmi.suspend_data');

    options = (suspendData == null || suspendData == '') ? {} : JSON.parse(suspendData);
    options.answers = options.answers || {};
    options.requiredBtn = options.requiredBtn || {};
    options.lastSection = options.lastSection || 1;
    options.questionSelect = options.questionSelect || {};
    options.scenario = options.scenario || {};
    options.scenario.decision = options.scenario.decision || {};

    $('body').addClass('data-loaded'); // Desabilita o loading após a conclusão do carregamento dos dados do suspend data
  };

  var checkRadios = function () {
    $('.question input[type="radio"]').on('click', function () {
      var $question = $(this).closest('.question');
      $question.find('.btn-save').removeClass('disabled').prop('disabled', false);
    });
    $('.question input[type="checkbox"]').on('click', function () {
      var $question = $(this).closest('.question');
      $question.find('.btn-save').removeClass('disabled').prop('disabled', false);
    });
    $('.question input[type="text"]').on('click', function () {
      var $question = $(this).closest('.question');
      $question.find('.btn-save').removeClass('disabled').prop('disabled', false);
    });
  };

  var question = function () {

    if (options.activityPoints) {
      $('.activity-percent-points').text(options.activityPoints);
    }

    if (options.activityPercent) {
      $('.activity-percent').text(options.activityPercent);
    }

    var activityPoints = options.activityPoints || '0';

    if (Object.keys(options.answers).length) {
      $('.question').each(function () {
        var $question = $(this);
        var id = $(this).data('scorm-id');
        var obj = options.answers[id];

        if (obj) {
          if (obj.type === 'discursive') {
            $question.addClass('question-answered');
            $question.attr('data-scorm-answered', true);
            for (var valueId in obj.values) {
              var value = obj.values[valueId];
              $question.find('textarea').filter(`[data-exercicio-textarea="${valueId}"]`).val(value);
              $question.find('textarea').filter(`[data-output-textarea="${valueId}"]`).val(value);
            }
          }

          if (obj.type === 'discursive-multiple') {
            $question.addClass('question-answered');
            $question.attr('data-scorm-answered', true);
            $question.find('.btn-edit').addClass('is-active');
            var $textareas = $question.find('textarea');
            $textareas.attr('readonly', true);
            for (var valueId in obj.values) {
              var value = obj.values[valueId];
              $question.find('textarea').filter(`[data-exercicio-textarea="${valueId}"]`).val(value);
            }
          }

          if (obj.type === 'question-select') {
            $question.attr('data-attempt', obj.attempts);
            var attempt = Number($question.data('scorm-attempt'));
            if (attempt <= obj.attempts || obj.score == obj.totalScore) {
              $question.find('.btn-save').addClass('disabled').prop('disabled', true);
              $question.addClass('show-last-feedback');
              $question.attr('data-scorm-answered', true);
              $question.addClass('feedback-' + obj.selectFeedback + '-open');
              if (obj.selectFeedback == 'negative') {
                $question.find('.last-feedback').addClass('is-active');
              }
            } else if (obj.attempts < attempt && obj.attempts > 0) {
              $question.find('.btn-save').removeClass('disabled').prop('disabled', false);
              // $question.attr('data-scorm-answered', true);
              $question.addClass('feedback-' + obj.selectFeedback + '-open');
              if (obj.selectFeedback == 'negative') {
                $question.find('.first-feedback').addClass('is-active');
                $question.find('select').addClass('chosen-answer');
              }
            }
          }

          if (obj.type === 'objective') {
            $question.attr('data-scorm-attempt-total', obj.attempts);
            var attempt = Number($question.data('scorm-attempt'));
            if (attempt <= obj.attempts || obj.score == '1') {
              $question.find('.btn-save').addClass('disabled').prop('disabled', true);
              $question.find('input:radio').prop('disabled', true);
              $question.addClass('show-last-feedback');
              $question.attr('data-scorm-answered', true);
            }
            $question.find('input:radio').filter('[value="' + obj.value + '"]').prop('checked', true);
            $question.find('.question-feedback').filter('[data-scorm-feedback="' + obj.value + '"]').addClass('is-open');
          }

          if (obj.type === 'objective-multiple') {
            $question.attr('data-scorm-attempt-total', obj.attempts);
            var attempt = Number($question.data('scorm-attempt'));
            if (attempt <= obj.attempts || obj.score == obj.totalScore) {
              $question.find('.btn-save').addClass('disabled').prop('disabled', true);
              $question.find('input:checkbox').prop('disabled', true);
              $question.addClass('show-last-feedback');
              $question.attr('data-scorm-answered', true);
            }
            for (var i = 0; i < obj.checkboxId.length; i++) {
              $question.find('input:checkbox').filter('[id="' + obj.checkboxId[i] + '"]').prop('checked', true);
            }
            if (obj.checkboxFeedback == 'positive') {
              $question.find('.question-feedback[data-scorm-feedback="positive"]').addClass('is-open');
            }
            if (obj.checkboxFeedback == 'negative') {
              $question.find('.question-feedback[data-scorm-feedback="negative"]').addClass('is-open');
            }
          }

          if (obj.type === 'objective-minmax') {
            $question.attr('data-scorm-attempt-total', obj.attempts);
            var attempt = Number($question.data('scorm-attempt'));
            var totalScore = obj.score ? obj.score : 0;
            if (obj.attempts > 0) {
              $question.find('.btn-save').addClass('disabled').prop('disabled', true);
              $question.find('input:radio').prop('disabled', true);
              $question.attr('data-scorm-answered', true);
              $question.find('.question-minmax-total').text(totalScore);
            }
            if (obj.attempts < attempt) {
              $question.find('.btn-try-again').addClass('is-active');
            }
            var radiosChecked = obj.radios;
            radiosChecked.forEach(function (item, index) {
              $('input#' + item).prop('checked', true);
            });
            $question.find('.question-feedback').filter('[data-scorm-feedback="' + obj.feedback + '"]').addClass('is-open');
          }

          if (obj.type === 'objective-associative') {
            $question.attr('data-scorm-attempt-total', obj.attempts);
            var attempt = Number($question.data('scorm-attempt'));
            var $inputTexts = $question.find('.input-text');
            var $feedbacks = $question.find('.question-feedback');
            $inputTexts.each(function () {
              var inputId = $(this).attr('id');
              var answer = obj.inputTextAnswers[inputId].answered ? obj.inputTextAnswers[inputId].answered : "";
              $(this).val(answer);
            })
            if (attempt <= obj.attempts || obj.score == obj.totalScore) {
              $question.find('.btn-save').addClass('disabled').prop('disabled', true);
              $inputTexts.prop('disabled', true);
              $question.addClass('show-last-feedback');
              $question.attr('data-scorm-answered', true);
              $question.find('.question-associative-total').text(obj.score);
              for (var id in obj.inputTextAnswers) {
                if (obj.inputTextAnswers[id].correct == 0) {
                  $question.find(`#${id}`).closest('.question-alternative').addClass('not-correct');
                }
              }
            }
            $feedbacks.removeClass('is-open').filter(`[data-scorm-feedback="${obj.feedback}"]`).addClass('is-open');
          }

          if (obj.type === 'drag-and-drop') {
            $question.attr('data-scorm-attempt-total', obj.attempt);

            let $questionAttempts = parseInt($question.attr('data-scorm-attempt'));

            if (obj.feedback === 'positive') {
              $question.attr('data-scorm-answered', true);
              $question.addClass('show-last-feedback');
              $question.find('.question-feedback').removeClass('is-open').filter('[data-scorm-feedback="positive"]').addClass('is-open');

              $question.find('.btn-save').addClass('disabled');
              $question.find('.btn-reset').addClass('disabled');
            }

            if (obj.feedback === 'negative') {
              $question.addClass('answered');
              $question.find('.question-feedback').removeClass('is-open').filter('[data-scorm-feedback="negative"]').addClass('is-open');

              $question.find('.btn-save').addClass('disabled');
            }

            if (obj.attempt === $questionAttempts) {
              $question.attr('data-scorm-answered', true);
              $question.addClass('show-last-feedback');

              $question.find('.btn-save').addClass('disabled');
              $question.find('.btn-reset').addClass('disabled');
            }

            Object.keys(obj.dropItem).forEach(function (dropEl) {
              var $droppable = $question.find('.droppable[data-drop-item-id="' + dropEl + '"]');
              obj.dropItem[dropEl].forEach(function (dragEl) {
                var draggableHtml = $question.find('.draggable[data-drag-item-id="' + dragEl + '"]').addClass('ui-draggable-disabled').html();
                $droppable.addClass('ui-droppable-disabled');
                $droppable.append('<div class="dropped">' + draggableHtml + '</div>');
              })
            });
          }
        }
      });
    }

    $('.btn-save').on('click', function (e) {
      e.preventDefault();

      var $btnSave = $(this);
      var $question = $(this).closest('.question');
      var $textarea = $question.find('.textarea');
      var $inputs = $question.find('input:radio');
      var $checkboxs = $question.find('input:checkbox');
      var $inputtexts = $question.find('input:text');
      var $feedbacks = $question.find('.question-feedback');
      var $selects = $question.find('select');
      var questionID = $question.data('scorm-id');
      var $questionSelectTotalScore = $selects.length;
      var $questionTotalScore = $question.data('scorm-total-score');
      var dataScormPercent = $question.data('scorm-percent');
      var dataScormPartial = $question.data('scorm-partial');
      options.answers[questionID] = {};
      var type = $question.data('scorm-type');
      var $totalActivityPercent = $('.question[data-scorm-percent="true"]').length;

      if (type == 'discursive') {
        $question.addClass('question-answered').find('.question-output').each(function () {
          var valueId = $(this).data('output-textarea');
          var value = $textarea.filter('[data-exercicio-textarea=' + valueId + ']').val();
          var values = options.answers[questionID].values ? options.answers[questionID].values : {}
          $(this).val(value);
          values[valueId] = value;
          options.answers[questionID].values = values;
          options.answers[questionID].type = 'discursive';
        });
        $question.attr('data-scorm-answered', true);
      }

      if (type == 'discursive-multiple') {
        $question.addClass('question-answered');
        $textarea.each(function () {
          $(this).attr('readonly', true);
          var valueId = $(this).data('exercicio-textarea');
          var value = $(this).val();
          var values = options.answers[questionID].values ? options.answers[questionID].values : {}
          values[valueId] = value;
          options.answers[questionID].values = values;
          options.answers[questionID].type = 'discursive-multiple';
        });
        $question.attr('data-scorm-answered', true);
        $question.find('.btn-edit').addClass('is-active');
      }

      if (type == 'question-select') {
        var count = $question.attr('data-attempt');
        var attempt = Number($question.data('scorm-attempt'));
        count = parseInt(count) + 1;
        $question.attr('data-attempt', count);
        var score = 0;
        var selects = [];
        $question.find('select.chosen-answer').each(function (i) {
          score += isNaN(parseInt($(this).val())) ? 0 : parseInt($(this).val());
          selects[i] = $(this).attr('id');
        });
        if ($questionSelectTotalScore == score) {
          var feedback = $feedbacks.removeClass('is-open').filter('.question-feedback-positive').addClass('is-open');
          var selectFeedback = 'positive';
        } else {
          var feedback = $feedbacks.removeClass('is-open').filter('.question-feedback-negative').addClass('is-open');
          var selectFeedback = 'negative';
        }
        if (attempt <= count || score == $questionSelectTotalScore) {
          $(this).closest('.btn-save').addClass('disabled').prop('disabled', true);
          $(this).closest('.question').addClass('show-last-feedback');
          $question.attr('data-scorm-answered', true);
        }
        if ($question.data('scorm-percent') == true) {
          if (score == $questionSelectTotalScore) {
            activityPoints = parseFloat(activityPoints) + parseFloat(1);
            options.activityPoints = activityPoints;
          } else {
            activityPoints = parseFloat(activityPoints);
            options.activityPoints = activityPoints;
          }
          options.activityPercent = ((options.activityPoints * 100) / $totalActivityPercent).toFixed(2);
          $('.activity-percent-points').text(options.activityPoints);
          $('.activity-percent').text(options.activityPercent);
        }
        options.answers[questionID].score = score;
        options.answers[questionID].totalScore = $questionSelectTotalScore;
        options.answers[questionID].selects = selects;
        options.answers[questionID].selectFeedback = selectFeedback;
        options.answers[questionID].type = 'question-select';
        options.answers[questionID].attempts = count;
      }

      if (type == 'objective') {
        var count = Number($question.attr('data-scorm-attempt-total') ? $question.attr('data-scorm-attempt-total') : 0);
        count = count + 1;
        $question.attr('data-scorm-attempt-total', count);
        var attempt = Number($question.data('scorm-attempt'));
        var score = $inputs.filter('[data-scorm-target="1"]').is(':checked') ? '1' : '0';
        var value = $inputs.filter(':checked').val();
        var feedback = $feedbacks.removeClass('is-open').filter('[data-scorm-feedback="' + value + '"]').addClass('is-open');
        if (attempt <= count || score == '1') {
          $(this).closest('.btn-save').addClass('disabled').prop('disabled', true);
          $inputs.prop('disabled', true);
          $(this).closest('.question').addClass('show-last-feedback');
          $question.attr('data-scorm-answered', true);
        }
        if ($question.data('scorm-percent') == true) {
          if (score == '1') {
            activityPoints = parseFloat(activityPoints) + parseFloat(1);
            options.activityPoints = activityPoints;
          } else {
            activityPoints = parseFloat(activityPoints);
            options.activityPoints = activityPoints;
          }
          options.activityPercent = ((options.activityPoints * 100) / $totalActivityPercent).toFixed(2);
          $('.activity-percent-points').text(options.activityPoints);
          $('.activity-percent').text(options.activityPercent);
        }
        options.answers[questionID].value = value;
        options.answers[questionID].score = score;
        options.answers[questionID].type = 'objective';
        options.answers[questionID].attempts = count;
      }

      if (type == 'objective-multiple') {
        var count = Number($question.attr('data-scorm-attempt-total') ? $question.attr('data-scorm-attempt-total') : 0);
        count = count + 1;
        $question.attr('data-scorm-attempt-total', count);
        var attempt = Number($question.data('scorm-attempt'));
        var score = 0;
        var checkboxId = [];
        $question.find('input:checkbox:checked').each(function (i) {
          score += isNaN(parseInt($(this).val())) ? 0 : parseInt($(this).val());
          checkboxId[i] = $(this).attr('id');
        });
        if ($questionTotalScore == score) {
          var feedback = $feedbacks.removeClass('is-open').filter('[data-scorm-feedback="positive"]').addClass('is-open');
          var checkboxFeedback = 'positive';
        } else {
          var feedback = $feedbacks.removeClass('is-open').filter('[data-scorm-feedback="negative"]').addClass('is-open');
          var checkboxFeedback = 'negative';
        }
        if (attempt <= count || score == $questionTotalScore) {
          $(this).closest('.btn-save').addClass('disabled').prop('disabled', true);
          $checkboxs.prop('disabled', true);
          $(this).closest('.question').addClass('show-last-feedback');
          $question.attr('data-scorm-answered', true);
        }
        if ($question.data('scorm-percent') == true) {
          if (score == $questionTotalScore) {
            activityPoints = parseFloat(activityPoints) + parseFloat(1);
            options.activityPoints = activityPoints;
          } else {
            activityPoints = parseFloat(activityPoints);
            options.activityPoints = activityPoints;
          }
          options.activityPercent = ((options.activityPoints * 100) / $totalActivityPercent).toFixed(2);
          $('.activity-percent-points').text(options.activityPoints);
          $('.activity-percent').text(options.activityPercent);
        }
        options.answers[questionID].score = score;
        options.answers[questionID].totalScore = $questionTotalScore;
        options.answers[questionID].checkboxId = checkboxId;
        options.answers[questionID].checkboxFeedback = checkboxFeedback;
        options.answers[questionID].type = 'objective-multiple';
        options.answers[questionID].attempts = count;
      }

      if (type == 'objective-minmax') {
        var $questionInputType = $question.attr('data-input-type');
        var $minmaxInputs = ($questionInputType == "checkbox") ? $checkboxs : $inputs;
        var count = Number($question.attr('data-scorm-attempt-total') ? $question.attr('data-scorm-attempt-total') : 0);
        count = count + 1;
        $question.attr('data-scorm-attempt-total', count);
        $question.find('.btn-try-again').addClass('is-active');

        var attempt = Number($question.data('scorm-attempt'));

        var score = 0;
        var radios = [];
        var feedback = '';

        $minmaxInputs.filter(':checked').each(function (e) {
          score = score + parseInt($(this).val());
          radios = [...radios, $(this).attr('id')];
        });

        $(this).closest('.btn-save').addClass('disabled').prop('disabled', true);
        $minmaxInputs.prop('disabled', true);
        $question.attr('data-scorm-answered', true);

        $feedbacks.each(function (index) {
          var min = parseInt($feedbacks[index].dataset.scoreMin);
          var max = parseInt($feedbacks[index].dataset.scoreMax);
          var feed = $feedbacks[index].dataset.scormFeedback;

          if (score >= min && score <= max) {
            $(this).closest('.question-minmax .question-feedback[data-scorm-feedback="' + feed + '"]').addClass('is-open');
            feedback = feed;
          }
        });

        if (count == attempt) {
          $question.find('.btn-try-again').removeClass('is-active');
        }

        $question.find('.question-minmax-total').text(score);

        options.answers[questionID].radios = radios;
        options.answers[questionID].score = score;
        options.answers[questionID].feedback = feedback;
        options.answers[questionID].type = 'objective-minmax';
        options.answers[questionID].attempts = count;
      }

      if (type == 'objective-associative') {
        var count = Number($question.attr('data-scorm-attempt-total') ? $question.attr('data-scorm-attempt-total') : 0);
        count = count + 1;
        $question.attr('data-scorm-attempt-total', count);

        var attempt = Number($question.data('scorm-attempt'));
        var questionTotalAlternatives = $question.find('.question-alternative').length;
        var feedbackByRange = $feedbacks.data('score-minmax');
        var dataScormPartial = $question.data('scorm-partial');
        var score = 0;
        var inputTextAnswers = {};
        var feedback = '';
        var completed = false;

        $inputtexts.each(function (i) {
          var correctValue = $(this).data('value').toString();
          var answeredValue = $(this).val().toString();
          var alternativeId = $(this).attr('id');
          var correct = correctValue.toLowerCase() == answeredValue.toLowerCase() ? 1 : 0;
          score += correct;
          inputTextAnswers[alternativeId] = { answered: answeredValue, correct: correct };
        });

        if (feedbackByRange) {
          $feedbacks.each(function (index) {
            var range = $feedbacks[index].dataset.scoreMinmax.split('-');
            var min = parseInt(range[0]);
            var max = parseInt(range[1]);
            if (score >= min && score <= max) {
              feedback = $feedbacks[index].dataset.scormFeedback;
            }
          });
        }
        else {
          feedback = questionTotalAlternatives == score ? 'positive' : 'negative';
        }

        $feedbacks.removeClass('is-open').filter(`[data-scorm-feedback="${feedback}"]`).addClass('is-open');

        if (attempt == count || score == questionTotalAlternatives) {
          completed = true;
          $btnSave.addClass('disabled').prop('disabled', true);
          $inputtexts.prop('disabled', true);
          $question.addClass('show-last-feedback');
          $question.attr('data-scorm-answered', true);
          $question.find('.question-associative-total').text(score);
          for (var id in inputTextAnswers) {
            if (inputTextAnswers[id].correct == 0) {
              $question.find(`#${id}`).closest('.question-alternative').addClass('not-correct');
            }
          }
        }
        if (dataScormPercent && completed) {
          if (score == questionTotalAlternatives) {
            activityPoints = parseFloat(activityPoints) + parseFloat(1);
          }
          else if (dataScormPartial) {
            activityPoints = (parseFloat(activityPoints) + parseFloat(score / questionTotalAlternatives)).toPrecision(2);
          }
          else activityPoints = activityPoints;

          options.activityPoints = activityPoints;
          options.activityPercent = ((options.activityPoints * 100) / $totalActivityPercent).toFixed(2);
          $('.activity-percent-points').text(options.activityPoints);
          $('.activity-percent').text(options.activityPercent);
        }

        options.answers[questionID].score = score;
        options.answers[questionID].totalScore = questionTotalAlternatives;
        options.answers[questionID].inputTextAnswers = inputTextAnswers;
        options.answers[questionID].feedback = feedback;
        options.answers[questionID].type = 'objective-associative';
        options.answers[questionID].attempts = count;
      }

      if (type == 'drag-and-drop') {
        var $numberCorrect = 0;
        let wrong;
        var $dropQuant = 0;
        var $dropItens = $(this).closest('.question').find('.droppable');
        $dropQuant = $dropItens.length;
        var $dropLimit = $question.find('.droppable').data('drop-limit');

        var $questionAttempts = parseInt($question.attr('data-scorm-attempt'));
        var $questionAttemptsTotal = $question.attr('data-scorm-attempt-total') ? $question.attr('data-scorm-attempt-total') : 0;
        $questionAttemptsTotal = parseInt($questionAttemptsTotal) + 1;

        $question.attr('data-scorm-attempt-total', $questionAttemptsTotal);
        $question.addClass('answered');

        options.answers[questionID].dropItem = {};

        options.activityPoints = options.activityPoints || '0';
        options.activityPercent = options.activityPercent || '0';

        $dropItens.each(function (i, item) {
          let values = []
          var dropItem = item;
          var dropItemAcceptValue = String($(dropItem).data('accept-value'));
          if (dropItemAcceptValue.length > 1) {
            values = dropItemAcceptValue.split('-')
          } else {
            values = dropItemAcceptValue
          }

          var droppedItemValue = $($(dropItem).find('.dropped').data('value'));
          var droppedItemValueFinal = droppedItemValue[0];
          var $dropItemId = $(dropItem).data('drop-item-id');
          var dragItemDropped = [];

          $(dropItem).find('.dropped').each(function (i, item) {
            var $currentItemId = $(this).data('drag-item-id');
            dragItemDropped[i] = $currentItemId;
            options.answers[questionID].dropItem[$dropItemId] = dragItemDropped;
            if (!values.includes(String($(this).data('value')))) {
              wrong = true
            }
            $numberCorrect = $numberCorrect + 1;

          });
        });

        let $compareType = $dropQuant;

        if ($numberCorrect >= $compareType && !wrong) {
          if ($question.attr('data-scorm-percent') === 'true') {
            options.activityPoints = parseFloat(options.activityPoints) + parseFloat(1);
          }

          $question.attr('data-scorm-answered', true);
          $question.addClass('show-last-feedback');
          $question.find('.question-feedback').removeClass('is-open').filter('[data-scorm-feedback="positive"]').addClass('is-open');

          $question.find('.btn-save').addClass('disabled');
          $question.find('.btn-reset').addClass('disabled');

          options.answers[questionID].feedback = 'positive';
        } else {
          $question.find('.question-feedback').removeClass('is-open').filter('[data-scorm-feedback="negative"]').addClass('is-open');
          $question.find('.btn-reset').addClass('is-active');
          options.answers[questionID].feedback = 'negative';
        }

        if ($questionAttemptsTotal === $questionAttempts) {
          $question.attr('data-scorm-answered', true);
          $question.addClass('show-last-feedback');

          $question.find('.btn-save').addClass('disabled');
          $question.find('.btn-reset').addClass('disabled');
        }

        options.activityPercent = ((options.activityPoints * 100) / $totalActivityPercent).toFixed();
        $('.activity-percent-points').text(options.activityPoints);
        $('.activity-percent').text(options.activityPercent);

        options.answers[questionID].type = 'drag-and-drop';
        options.answers[questionID].attempt = $questionAttemptsTotal;

        $(this).addClass('disabled');
      }

      var scormType = $('body').data('scorm-type');
      var dataSectionActivity = $('.section.is-active').data('section-activity');
      scormType === 'activity' && checkQuestions();
      scormType === 'activity-percent' && checkQuestionsPercent();
      dataSectionActivity && checkSectionQuestions();

      autosize.update($('.autogrow'));

      saveOptions(); // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".
    });

    $('.btn-edit').on('click', function (e) {
      e.preventDefault();
      $(this).closest('.question').removeClass('question-answered');
    });

    $('.btn-close-feedback').on('click', function (e) {
      e.preventDefault();
      $(this).closest('.question').removeClass('question-answered');
      $(this).closest('.question-feedback').removeClass('is-open');
    });

    $('.discursive-multiple .btn-edit').on('click', function (e) {
      e.preventDefault();
      let $question = $(this).closest('.question');
      var $textareas = $question.find('textarea');
      $question.attr('data-scorm-answered', false);
      $textareas.attr('readonly', false);
      $(this).removeClass('is-active');
    })

    $('.question-minmax .btn-try-again').on('click', function (e) {
      e.preventDefault();
      let question = $(this).closest('.question-minmax');

      question.attr('data-scorm-answered', false);
      question.find('.question-feedback').removeClass('is-open');
      question.find('input').prop('checked', false).attr('disabled', false);
      question.find('.question-minmax-total').text('0');

      $(this).removeClass('is-active');
    });
  };

  //question drag - inicio
  var questionDrag = function () {

    // Obtém o valor do atributo data-items-total da div com o atributo data-scorm-type="drag-and-drop"
    var totalItems = $('div[data-scorm-type="drag-and-drop"]').data('items-total');

    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (isMobileDevice()) {
      // Escuta o evento de início de arrastar
      $(document).on('touchstart', '.draggable', function (e) {
        var container = $(this).closest(".draggable-content").next(".droppable-content").find(".droppable")[0];
        if (container) {
          container.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // window.scrollBy(0, -10);
      });
    }

    $('.draggable').draggable({
      revert: 'invalid',
      scroll: true,
      stop: function (event, ui) {
        if ($('.click-apply-section').find('.dropped').length >= totalItems) {
          $(this).closest('.click-apply-section').find('.btn-save').click()
          $(this).closest('.click-apply-section').find('.accordion').removeClass('hide')
          $(this).closest('.click-apply-section').find('.accordion')[0].scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    });

    $('.droppable').each(function () {
      var limit = parseInt($(this).data('drop-limit'));

      $(this).droppable({
        accept: '.' + $(this).data('accept'),
        drop: function (event, ui) {
          var $droppable = $(this);
          var $dropped = $(ui.helper).clone().removeAttr('style').removeClass().addClass('dropped');

          $dropped.on('click', function () {
            $dropped.remove()
            $(ui.draggable).draggable('option', 'disabled', false);
            $droppable.droppable('option', 'disabled', false);
          });

          if ($dropped.data('drop')) {
            $droppable.append($dropped);
            $(ui.draggable).removeAttr('style').draggable('option', 'disabled', true);
          }

          if ($dropped.data('drag-stop')) {
            $(ui.draggable).draggable('option', 'disabled', true);
          }

          if (limit == $droppable.find('.dropped').length) {
            $droppable.droppable('option', 'disabled', true);
          }

          $dropped.trigger('drop-append');

          $(this).closest('.question').find('.btn-save').removeClass('disabled');
        }
      });
    });

    $('.question .btn-reset').on('click', function () {
      var $question = $(this).closest('.question[data-scorm-type="drag-and-drop"]');

      $question.find('.dropped').click();
      $question.find('.draggable').draggable('option', 'disabled', false);
      $question.find('.droppable').removeClass('ui-droppable-disabled');
      $question.find('.droppable .dropped').remove();

      $question.removeClass('answered');
      $question.find('.question-feedback').removeClass('is-open');
    })

  }
  //question-drag - fim

  // Question Select - Início
  var questionSelect = function () {

    $('.question-select select').change(function () {
      $(this).addClass('chosen-answer');

      var chosenAnswers = $(this).closest('.question-select').find('select.chosen-answer').length;
      var totalSelects = $(this).closest('.question-select').find('select').length;

      if (chosenAnswers === totalSelects) {
        $(this).closest('.question-select').find('.btn-save').removeClass('disabled');
      }
    });

    $('.question-select .btn-save').on('click', function () {
      var $question = $(this).closest('.question-select');
      var $attemptValue = parseInt($question.attr('data-attempt')) + 1;
      var $totalAttempt = $question.attr('data-scorm-attempt');
      var $questionSelect = $question.find('select');
      var $questionSelectTotal = $questionSelect.length;
      var $questionSelectId = $questionSelect.closest('.question-select').data('question-select-id');
      var $questionSelectTotalCorrect = 0;
      options.questionSelect[$questionSelectId] = {};
      options.questionSelect[$questionSelectId].selectItem = {};

      var questionSelectItems = $($questionSelect).each(function (index, item) {
        var $questionSelectItemId = item.id;
        var questionSelectItemIdValue = +$(`#${$questionSelectItemId}`).find(':selected').val();
        var questionSelectItemIdOption = +$(`#${$questionSelectItemId}`).find(':selected').data('option');
        $questionSelectTotalCorrect = + $questionSelectTotalCorrect + questionSelectItemIdValue;
        options.questionSelect[$questionSelectId].selectItem[$questionSelectItemId] = questionSelectItemIdOption;
      })
      options.questionSelect[$questionSelectId].selectTotalCorrect = $questionSelectTotalCorrect;
      options.questionSelect[$questionSelectId].selectTotal = $questionSelectTotal;

      // $(this).closest('.question').attr('data-scorm-answered', true);

      if ($questionSelectTotalCorrect === $questionSelectTotal) {
        $(this).closest('.question').removeClass('feedback-negative-open')
        $(this).closest('.question').addClass('question-answered feedback-positive-open');
        $(this).closest('.question-feedback-positive').addClass('feedback-open');
        $(this).closest('.btn-save').addClass('disabled');
        $('.body').addClass('feedback-is-open');
      }
      else if ($questionSelectTotalCorrect !== $questionSelectTotal) {
        $(this).closest('.question').addClass('feedback-negative-open');
        if ($attemptValue >= $totalAttempt) {
          $(this).closest('.question').find('.question-feedback-negative .last-feedback').addClass('is-active');
          $(this).closest('.question').find('.question-feedback-negative .first-feedback').removeClass('is-active');
          $(this).closest('.question').addClass('show-last-feedback');
          $(this).closest('.btn-save').addClass('disabled');
        } else {
          $(this).closest('.question').find('.question-feedback-negative .first-feedback').addClass('is-active');
        }
      }

      $('.question-select .btn-close-feedback').on('click', function () {
        $(this).closest('.question').removeClass('feedback-negative-open');
        $(this).closest('.question').removeClass('feedback-positive-open');
        $(this).closest('.question-feedback-positive').removeClass('is-open');
        $(this).closest('.question-feedback-negative').removeClass('is-open');
      })

      saveOptions(); // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".
    });

    if (Object.keys(options.questionSelect).length) {
      $('.question-select').each(function () {
        var $question = $(this);
        var $questionID = $(this).data('question-select-id');
        var obj = options.questionSelect[$questionID];

        if (obj) {
          // $question.attr('data-scorm-answered', true);
          if (options.questionSelect[$questionID].selectTotalCorrect === options.questionSelect[$questionID].selectTotal) {
            $question.find('.btn-save').addClass('disabled');
          }
          Object.keys(obj.selectItem).forEach(function (selectEl) {
            var $selectId = $question.find('select[id="' + selectEl + '"]');
            $selectId.find('option[data-option="' + obj.selectItem[selectEl] + '"]').attr('selected', 'selected');
          })
        }
      })
    }

  };
  // Question Select - Fim

  var questionsSetIds = function () {
    var questions = $('.question');

    questions.each(function (index) {
      if ($(this).attr('data-auto-id') === "false") return true;
      var type = $(this).attr('data-scorm-type');
      var questionId = (index + 1);

      $(this).attr('data-scorm-id', questionId);

      if (type === 'objective-minmax') {
        var alternatives = $(this).find('.alternative');
        var feedbacks = $(this).find('.question-feedback');

        alternatives.each(function (index) {
          var dataScormId = $(this).closest('.question-minmax').attr('data-scorm-id');
          var alternativeInputs = $(this).find("input");

          $(this).find('label').attr('for', 'q' + dataScormId + '-' + parseInt(index + 1));

          alternativeInputs.each(function (inputIndex) {
            $(this).attr('id', 'q' + questionId + 'opt' + parseInt(index + 1) + '-' + parseInt(inputIndex + 1));
            $(this).attr('name', 'q' + dataScormId + '-' + parseInt(index + 1));
          });
        });

        feedbacks.each(function (index) {
          $(this).attr('data-scorm-feedback', (index + 10).toString(36).toUpperCase());
        });
      } else if (type === 'objective-associative') {
        var alternatives = $(this).find('.question-alternative');
        var feedbacks = $(this).find('.question-feedback');

        alternatives.each(function (index) {
          var dataScormId = $(this).closest('.question').attr('data-scorm-id');
          var alternativeInputs = $(this).find("input");

          $(this).find('label').attr('for', 'q' + dataScormId + '-' + parseInt(index + 1));

          alternativeInputs.each(function (inputIndex) {
            $(this).attr('id', 'q' + questionId + 'opt' + parseInt(index + 1) + '-' + parseInt(inputIndex + 1));
            $(this).attr('name', 'q' + dataScormId + '-' + parseInt(index + 1));
          });
        });
        if (feedbacks.data('score-minmax')) {
          feedbacks.each(function (index) {
            $(this).attr('data-scorm-feedback', (index + 10).toString(36).toUpperCase());
          });
        }
      } else {
        var inputs = $(this).find('input');

        inputs.each(function (inputIndex) {
          inputIndex = parseInt(inputIndex + 1);

          $(this).next('label').attr('for', 'q' + questionId + 'opt' + inputIndex);
          $(this).attr('id', 'q' + questionId + 'opt' + inputIndex);
          $(this).attr('name', 'q' + questionId);
        });
      }
    });
  };

  var questionsSetInputtextSize = function () {
    $('.question').filter('[data-scorm-type="objective-associative"]').each(function () {
      var $question = $(this);
      if (!$question.data('input-size-auto') === "true") return false;

      var $inputTexts = $question.find('input[type="text"]');
      var maxLen = 0;
      $inputTexts.each(function () {
        var dataValue = ($(this).data('value')).toString();
        let thisLen = dataValue.length;
        if (thisLen >= maxLen) maxLen = thisLen;
      })
      $inputTexts.each(function () {
        $(this).attr({
          'size': parseInt(maxLen),
          'maxlength': maxLen,
          'autocomplete': 'off'
        });
      })
    })
  }

  var checkScormType = function () {
    var scormType = $('body').data('scorm-type');
    scormType === 'visualization-btn' && finishBtn();
    scormType === 'visualization-last' && checkLastSlide();
    scormType === 'visualization-required-btn' && checkRequiredBtn();
    scormType === 'visualization' && setScormCompleted();
    scormType === 'activity' && checkQuestions();
    scormType === 'activity-percent' && checkQuestionsPercent();

    if (doLMSGetValue('cmi.core.lesson_status') != 'completed') {
      setScormIncomplete();
    }
  };

  var checkQuestions = function () {
    var questionsLength = $('.question').length;
    var questionsAnswered = $('.question').filter('[data-scorm-answered="true"]').length;
    if (questionsLength == questionsAnswered) {
      setScormCompleted();
    }
  };

  var checkSectionQuestions = function () {
    var sectionQuestions = $('.section[data-section-activity="true"].is-active .question').length;
    var answeredSectionQuestions = $('.section[data-section-activity="true"].is-active .question').filter('[data-scorm-answered="true"]').length;
    if (sectionQuestions == answeredSectionQuestions) {
      $('.section.is-active .btn-nav-next').removeClass('disabled');
    }
  };

  var checkQuestionsPercent = function () {
    var questionsLength = $('.question[data-scorm-percent="true"]').length;
    var questionsAnswered = $('.question[data-scorm-percent="true"]').filter('[data-scorm-answered="true"]').length;
    if (questionsLength == questionsAnswered) {
      setScormCompleted();
    }
  };

  var checkRequiredBtn = function () {

    if (Object.keys(options.requiredBtn).length) {
      $('.required-btn').each(function () {
        var id = $(this).data('required-btn-id');
        if (options.requiredBtn[id]) {
          $(this).addClass('was-clicked');
        }
      });
    }

    var $requiredBtns = $('.required-btn');

    $requiredBtns.on('click', function () {
      var id = $(this).data('required-btn-id');
      $(this).addClass('was-clicked');
      options.requiredBtn[id] = 1;
      if ($requiredBtns.length === $requiredBtns.filter('.was-clicked').length) {
        setScormCompleted();
      }
      saveOptions(); // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".
    });

    if ($('.content-mobile').css('display') == 'none') {
      $('.content-mobile .required-btn').addClass('was-clicked');
    }
    if ($('.content-desk').css('display') == 'none') {
      $('.content-desk .required-btn').addClass('was-clicked');
    }

  };

  var finishBtn = function () {
    $('.btn-finish').on('click', function (e) {
      e.preventDefault();
      setScormCompleted();
    })
  };

  var checkLastSlide = function () {
    var sectionLength = $('.section').length;
    $.scrollify.setOptions({
      after: function (index) {
        options.lastSlide = index;
        if (options.lastSlide === sectionLength - 1) {
          setScormCompleted();
        }
        saveOptions(); // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".
      }
    })
  };

  var loadLastSlide = function () {
    $.scrollify.move(options.lastSlide);
  };

  var nav = function () {

    var totalSections = $('.section').length;

    // Se já existir currentSection no suspendData ao acessar o curso, faz as inicializações necessárias.
    if (options.currentSection) {
      $('.section').removeClass('is-active');
      $('.section[data-section-id="' + options.currentSection + '"]').addClass('is-active');
      $('body').attr('data-section-current', options.currentSection);
      $('.progress-bar .progress-value').text(parseInt(((options.lastSection) * 100) / totalSections) + '%');
      $('.progress-bar .progress-fill').css('width', parseInt((options.lastSection) * 100) / totalSections + '%');
      $('.menu .btn-nav').each(function () {
        var btnNavId = $(this).data('btn-nav-id');
        $(this).removeClass('is-active');
        if (btnNavId <= options.lastSection) {
          $(this).removeClass('disabled');
        }
        if (btnNavId == options.currentSection) {
          $(this).addClass('is-active').removeClass('disabled');
        }
      });
      setTimeout(() => {
        $('.drag-the-handle').twentytwenty();
      }, 1000);
    } else {
      // Se não existir currentSection no suspendData ao acessar o curso, atualiza a Barra de Progresso com o valor inicial.
      $('.progress-bar .progress-value').text(parseInt(100 / totalSections) + '%');
      $('.progress-bar .progress-fill').css('width', parseInt(100 / totalSections) + '%');
    }

    // Verifica se as sections possuem o atributo data-section-activity = "true", caso sim, desabilita o seu botão de avançar.
    $('.btn-nav-next').each(function () {
      var $btnNext = $(this);
      var $btnSection = $(this).closest(".section");
      var btnSectionId = $(this).closest('.section').data('section-id');
      var btnSectionQuestions = $btnSection.find('.question').length;
      var btnSectionAnsweredQuestions = $btnSection.find('.question').filter('[data-scorm-answered="true"]').length;
      if ($btnSection.data('section-activity') == true) {
        $btnNext.addClass('disabled');
      }
      if (btnSectionId < options.lastSection || btnSectionQuestions == btnSectionAnsweredQuestions) {
        $btnNext.removeClass('disabled');
      }
    });

    // Botão para abrir e fechar o menu
    $('.menu .btn-toggle-menu').on('click', function () {
      $(this).closest('.menu').toggleClass('is-active');
    })

    $('.btn-nav').on('click', function () { // navegação por sections 

      if ($(this).hasClass('btn-nav-prev')) { // se clicar no botão retornar
        options.currentSection = $(this).closest('.section').data('section-id') - 1; // retorna uma seção
      }

      if ($(this).hasClass('btn-nav-next')) { // se clicar no botão avançar
        options.currentSection = $(this).closest('.section').data('section-id') + 1; // avança uma seção
        if (options.currentSection >= options.lastSection) { // não permite a barra de progresso regredir
          options.lastSection = options.currentSection;
        }
      }

      if ($(this).hasClass('btn-nav-id')) { // se clicar em um botão que ativa uma seção específica
        options.currentSection = $(this).data('btn-nav-id'); // ativa a seção com o mesmo valor do atributo data-btn-nav-id do botão
        if (options.currentSection >= options.lastSection) { // não permite a barra de progresso regredir
          options.lastSection = options.currentSection;
        }
        $(this).closest('.menu').removeClass('is-active');
      }

      if ($(this).data('reset-progress') == true) { // se o botão possuir o atributo data-reset-progress="true".
        options.lastSection = 1; // reinicia a barra de progresso
      }

      $('.section').removeClass('is-active');
      $('.section[data-section-id="' + options.currentSection + '"]').addClass('is-active');
      $('body').attr('data-section-current', options.currentSection);

      $('.progress-bar .progress-value').text(parseInt(((options.lastSection) * 100) / totalSections) + '%');
      $('.progress-bar .progress-fill').css('width', ((options.lastSection) * 100) / totalSections + '%');

      $('.menu .btn-nav').removeClass('is-active');
      $('.menu .btn-nav[data-btn-nav-id="' + options.currentSection + '"]').addClass('is-active').removeClass('disabled');

      saveOptions(); // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".

      // Resets após troca de seção - Início

      $('.plyr__controls').find('button[aria-label="Pause"]').click();

      $('html, body').animate({
        scrollTop: $('body').offset().top
      }, 1000)

      setTimeout(() => {
        $('.drag-the-handle').twentytwenty();
      }, 1000);

      $('.slideshow-list').slick('setPosition');
      AOS.refresh();

      // Resets após troca de seção - Fim

    })
  };

  // Atenção: a função saveOptions nunca deve ser chamada antes da função setScormCompleted, pois isso pode acarretar em um problema de assincronismo e fazer com que o SCO fique marcado como "incomplete".
  var saveOptions = function () {
    doLMSSetValue('cmi.suspend_data', JSON.stringify(options));
    doLMSCommit('');
  };

  var setScormIncomplete = function () {
    if (doLMSGetValue('cmi.core.lesson_status') != 'incomplete') {
      doLMSSetValue('cmi.core.lesson_status', 'incomplete');
      doLMSCommit('');
    }
  };

  var setScormCompleted = function () {
    if (doLMSGetValue('cmi.core.lesson_status') != 'completed') {
      if ($('body').data('scorm-type') == 'activity-percent') {
        doLMSSetValue('cmi.core.score.raw', options.activityPercent);
      }
      doLMSSetValue('cmi.suspend_data', JSON.stringify(options)); // Esta linha é necessária para setar os dados do suspend data antes de realizar o commit de lesson_status "completed", para prevenir problemas de assincronismo.
      doLMSSetValue('cmi.core.lesson_status', 'completed');
      doLMSCommit('');
    }
  };

  const plyr = function () {
    const players = Plyr.setup('.podcast .plyr-player');

    if (players) {
      players.forEach(function (player) {
        player.on('play', function () {
          const others = players.filter(other => other != player)
          others.forEach(function (other) {
            other.pause();
          })
        });
        player.on('ended', function () {
          $(this).closest('.section').find('.footer-section .btn-inactive.inactive').removeClass('inactive');
          $('.btn-disabled').removeClass('btn-disabled-disabled');
          player.currentTime = 0;
          options.sectionFirst = 1;
        });
      });
    }
  };

  var scenarioSequential = function () {
    var cenaAtual = 0;
    var cenas = [];

    var dataScenes = $(".scenario-sequential-block .data-scenes").data("scenes");

    if (dataScenes) {
      cenas = dataScenes;
    }

    if (options.scenario && Object.keys(options.scenario).length > 0) {
      if (options.scenario.actualScene) {
        cenaAtual = options.scenario.actualScene;
        atualizarCena();
      }
    } else {
      atualizarCena();
    }


    atualizarBotoes();

    $(".btn-continue").click(function () {
      // Verifique se há mais cenas

      if (cenaAtual < cenas.length - 1) {
        cenaAtual++;
        atualizarCena();
        options.scenario.actualScene = cenaAtual
        saveOptions();
      }
      atualizarBotoes();
    });

    $(".btn-restart").click(function () {
      // Reinicie o cenário
      cenaAtual = 0;
      atualizarCena();
      atualizarBotoes();
    });

    function atualizarCena() {
      var personagemIndex = cenas[cenaAtual][0];
      var textoIndex = cenas[cenaAtual][1];

      // Desative a cena anterior
      $(".scenario-sequential-block-character .img-character.active").removeClass("active");
      $(".scenario-sequential-text.active").removeClass("active");

      // Verificar se a imagem do personagem existe antes de ativar a nova cena
      var personagemClass = ".scenario-sequential-block-character .img-character.img-character-" + (personagemIndex);
      if ($(personagemClass).length) {
        $(personagemClass).addClass("active");
      } else {
        $(".scenario-sequential-block-character .img-character.no-img-character").addClass("active");
      }

      // Verificar se o texto da cena existe antes de ativar a nova cena
      var textoClass = ".scenario-sequential-text.scenario-sequential-text-" + (textoIndex);
      if ($(textoClass).length) {
        $(textoClass).addClass("active");
      } else {
        $(".scenario-sequential-text.scenario-sequential-no-text").addClass('active')
        $(".alert-scene-text").text(cenaAtual)
      }

    }

    function atualizarBotoes() {
      if (cenaAtual < cenas.length - 1) {
        // Exibir botão de continuar
        $(".btn-continue").addClass("active");
        $(".btn-restart").removeClass("active");
      } else {
        // Exibir botão de recomeçar na última cena
        $(".btn-continue").removeClass("active");
        $(".btn-restart").addClass("active");
      }
    }
  }

  var scenarioDecision = function () {
    var allScenes = []
    var dialogContainer = $(".scenario-decision-dialogue-block");
    var characterBlock = $(".scenario-decision-block-character");
    var dialogScenes = $(".scenario-decision-scenes");
    var dialogScenesButtons = dialogScenes.find('.dialogue-button')
    var firstDialog = $(".scene-01 .dialogue-question:first").text();

    // Função para verificar e aplicar a classe was-clicked
    function checkButtonClick() {
      // Verifica se options e seus subníveis estão definidos
      if (options && options.scenario && options.scenario.decision && options.scenario.decision.btns) {
        // Itera sobre os botões no objeto options.scenario.decision.btns
        options.scenario.decision.btns.forEach(function (btn, index) {
          // Verifica se a propriedade wc (wasClicked) é igual a 1
          if (btn && btn.wc === 1) {
            // Encontra o botão correspondente pelo índice
            var button = dialogScenesButtons.eq(index);

            // Adiciona a classe was-clicked ao botão
            button.addClass('was-clicked');
          }
        });
      }
    }

    // ---------------------
    var scenes = dialogScenes.find('.decision-scenes')
    var sceneActive = dialogScenes.filter('.decision-scenes.active')


    if (dialogScenesButtons && dialogScenesButtons.length > 0) {
      checkButtonClick();
      options.scenario.decision.btns = dialogScenesButtons.toArray().map(function (el, index) {
        $(el).attr("data-scenario-button-id", index);
        return { wc: 0 };
      });
      saveOptions();

      dialogScenesButtons.click(function () {
        checkButtonClick();
        // Obtém o índice do botão clicado
        var index = $(this).data("scenario-button-id");

        // Adiciona a propriedade "wasClicked" ao botão clicado
        options.scenario.decision.btns[index].wc = 1;

        // Salva as opções
        saveOptions();
      });
    }


    if (sceneActive.length === 0) {
      dialogScenes.find('.scene-01').addClass('active')
      characterBlock.find('.img-character.initial').addClass('active')
    }

    if (scenes && scenes.length > 0) {
      allScenes.push(scenes)
    }

    // ---------------------

    if (firstDialog.length > 3) {
      var dialogToInsert = $('<p class="dialogue visible">' + firstDialog + '</p>')
      dialogContainer.append(dialogToInsert)
    }

    dialogScenes.find(".dialogue-button").click(function () {

      var dialogues = $(".scenario-decision-dialogue-block .dialogue");
      var thisContent = $(this).text();
      var nextScene = $(this).data('dialog-next')
      var dialogToInsert = $('<p class="dialogue visible">' + thisContent + '</p>')
      options.scenario.decision.act_scene = nextScene
      console.log(options.scenario.decision.act_scene)

      dialogContainer.append(dialogToInsert)
      dialogContainer.animate({
        scrollTop: dialogContainer[0].scrollHeight
      }, 500);

      dialogues.removeClass("visible");



      dialogScenes.find('.decision-scenes').each(function (e) {
        $(this).removeClass('active')
      })

      if (nextScene.length > 8) {
        // console.log('é cena de feedback')
        var newScene = dialogScenes.find('.decision-scenes.' + nextScene.slice(0, 8));
        // console.log(nextScene)
        var sceneFeedback = dialogScenes.find('.decision-scenes .feedback-scene.' + nextScene);
        var allSceneButtons = dialogScenes.find('.decision-scenes .wrapper-buttons');
        var sceneFeedbackButtons = dialogScenes.find('.decision-scenes .feedback-scene.' + nextScene + ' .wrapper-buttons');

        allSceneButtons.addClass('hide')
        sceneFeedbackButtons.addClass('active')
        sceneFeedbackButtons.removeClass('hide')
        sceneFeedback.addClass('active');
        newScene.addClass('active');
        sceneFeedbackButtons.find('.dialogue-button').click(function () {
          allSceneButtons.removeClass('hide')
          sceneFeedbackButtons.removeClass('active')
          sceneFeedbackButtons.addClass('hide')
          sceneFeedback.addClass('active');
        })

        characterBlock.find(".img-character.active").removeClass("active");
        var nextCharacter = characterBlock.find('.img-character').filter(function () {
          var decisionCharacterArray = $(this).data('decision-character');
          return Array.isArray(decisionCharacterArray) && decisionCharacterArray.includes(nextScene);
        });

        if (nextCharacter) {
          nextCharacter.addClass("active");
        }

      }
      var newScene = dialogScenes.find('.decision-scenes.' + nextScene);

      //código html da div.dialogue-question
      var nextDialogText = $("." + nextScene + ' .dialogue-question:first').html();
      //código html da div.dialogue-question


      characterBlock.find(".img-character.active").removeClass("active");
      var nextCharacter = characterBlock.find('.img-character').filter(function () {
        var decisionCharacterArray = $(this).data('decision-character');
        return Array.isArray(decisionCharacterArray) && decisionCharacterArray.includes(nextScene);
      });

      if (nextCharacter) {
        nextCharacter.addClass("active");
      }


      var newDialog = $('<p class="dialogue visible">' + nextDialogText + '</p>')

      setTimeout(() => {
        dialogContainer.append(newDialog)
        newScene.addClass('active')
        dialogContainer.animate({
          scrollTop: dialogContainer[0].scrollHeight
        }, 500);
      }, 1000);


      saveOptions();

    })
  }

  var init = function () {
    $(document).ready(function () {
      doLMSInitialize('');
      getSuspendData();
      questionsSetIds();
      questionsSetInputtextSize();
      question();
      questionDrag();
      questionSelect();
      checkRadios();
      loadLastSlide();
      nav();
      checkScormType();
      // questionDragClick();
      plyr();

      // scenarioSequential();
      scenarioDecision();
    })
  }();

  return exports;

})(jQuery);

