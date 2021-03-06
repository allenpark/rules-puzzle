// Overrides the default autocomplete filter function to search only from the beginning of the string
$.ui.autocomplete.filter = function (array, term) {
    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
    return $.grep(array, function (value) {
        return matcher.test(value.label || value.value || value);
    });
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function toLowerCase(array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = array[i].toLowerCase();
  }
}

var nextNumMap = {'A': '1', '1': '2', '2': '3', '3': '4', '4': '5', '5': '6', '6': '7', '7': '8', '8': '9', '9': '10', '10': 'J', 'J': 'Q', 'Q': 'K'};
function nextNum(num) {
  return nextNumMap[num];
}

var nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var suits = ['S', 'H', 'D', 'C'];
var colors = ['R', 'G', 'B'];
colors.sort();
var all_colors = colors.join('');
var total_num = nums.length * suits.length * colors.length;
var cards = [];
var done_cards = [];
var entered = [];
var answer = "FAKE";
var autocompletes = [];
var card_history = [];
var clear_history = false;

var rules = {"A .* .*": "uno", "2 .* .*": "deuce", "3 .* .*": "charm", "4 .* .*": "crowd", "5 .* .*": "handful", "7 .* .*": "lucky", "8 .* .*": "ate", "10 .* .*": "countdown", "J .* .*": "royal", "Q .* .*": "royal", "K .* .*": "royal", ".* S .*": "# of spades", ".* H .*": "love", ".* D .*": "$$$", ".* C .*": "night", ".* .* R": "rage", ".* .* G": "tea", ".* .* B": "blu ^", "A S .*": "prime", "Q S .*": "13 points", "A H .*": "<3", "2 H .*": "<3 <3", "3 H .*": "<3 <3 <3", "Q H .*": "off with her head", "4 D .*": "SPECIAL CODE CASE", "J D .*": "rich", "Q D .*": "richer", "K D .*": "richest", "A C .*": "odd", "2 C .*": "even", "3 C .*": "odd", "4 C .*": "even", "5 C .*": "odd", "6 C .*": "even", "7 C .*": "odd", "8 C .*": "even", "9 C .*": "odd", "10 C .*": "even", "J C .*": "odd", "Q C .*": "even", "K C .*": "odd", "4 .* G": "phone", "10 .* G": "why tho", "K .* B": "poseidon", ".* H R": "blood", ".* D R": "blood", ".* S G": "garden"};

function displayExpected(expected_rules) {
  $('#feedback').text("Failed! Expected: " + expected_rules.join(", ").toUpperCase());
}

function split(card) {
  var split = card.split(' ');
  return {num: split[0], suit: split[1], color: split[2]};
}

function check(given_card, entered_rules) {
  var matched_rules = [];
  var expected_rules = [];

  var split_card = split(given_card);

  for (var card in rules) {
    var expected = rules[card];
    if (RegExp(card, 'gi').test(given_card) && expected != '') {
      matched_rules.push(card);
      expected = expected.replace('#', split_card.num).replace('^', split_card.suit).replace('%', split_card.color);
      if (card == "4 D .*") {
	expected_rules.push('cut');
	expected_rules.push('clarity');
	expected_rules.push('carat');
	expected_rules.push('color');
      } else {
	expected_rules.push(expected);
      }
    }
  }

  if (card_history.length >= 1) {
    last_card = split(card_history[card_history.length - 1]);
    if (nextNum(last_card.num) == split_card.num || nextNum(split_card.num) == last_card.num) {
      expected_rules.push('off by one');
    }
    if (last_card.num == split_card.num || last_card.suit == split_card.suit) {
      expected_rules.push('match');
    }
    if (card_history.length >= 2) {
      last_last_card = split(card_history[card_history.length - 2]);
      if (last_last_card.num == split_card.num) {
	expected_rules.push('sandwich');
      }
      var last_colors = [split_card.color, last_card.color, last_last_card.color];
      last_colors.sort();
      if (last_colors.join('') == all_colors) {
	expected_rules.push('colorful');
      }
    }
  }

  console.log('CHECK:');
  console.log(matched_rules);
  console.log(expected_rules);
  console.log(entered_rules);

  if (expected_rules.length != entered_rules.length) {
    displayExpected(expected_rules);
    return false;
  }
  toLowerCase(expected_rules);
  toLowerCase(entered_rules);
  expected_rules.sort();
  entered_rules.sort();
  for (var i = 0; i < entered_rules.length; i++) {
    if (expected_rules[i] != entered_rules[i]) {
      displayExpected(expected_rules);
      return false;
    }
  }
  for (var i = 0; i < entered_rules.length; i++) {
    autocompletes.push(entered_rules[i]);
  }
  return true;
}

$(document).ready(function() {
  $('#total').text(total_num);
  for (var i = 0; i < nums.length; i++) {
    var num = nums[i];
    for (var j = 0; j < suits.length; j++) {
      var suit = suits[j];
      for (var k = 0; k < colors.length; k++) {
	var color = colors[k];
	cards.push(num + ' ' + suit + ' ' + color);
      }
    }
  }
  shuffle(cards);
  console.log(cards);

  $('#card').text(cards[0]);
  $('#progress').text(cards.length);

  $('#input').autocomplete({ source: autocompletes, delay: 0 });
  $('#input').keyup(function(event) {
    if (event.keyCode === 13) {
      $('#enter').click();
    }
  });

  $('#next').click(function() {
    if (clear_history) { $('#card_history').html(''); }
    $('#input').autocomplete('close');
    console.log("Input is:");
    console.log(cards[0]);
    console.log(entered);
    if (check(cards[0], entered)) {
      entered = [];
      $('#entered').html('');
      card_history.push(cards[0]);
      $('#card_history').append(cards[0] + "<br/>");
      done_cards.push(cards.shift());
      if (cards.length == 0) {
	$('#feedback').text("Failed! You didn't say LAST CARD. Penalty of " + (total_num - 1) + " cards.");
	$('#card').text("A H B");
	$('#progress').text(total_num);
	$('#next').off('click');
	$('#enter').off('click');
	$('#clear').off('click');
	$('#next').click(function() {
	  $('#feedback').text("Just kidding, you won! The answer is TODO!");
	  $('#next').off('click');
	  $('#enter').off('click');
	  $('#clear').off('click');
	});
	$('#enter').click(function() {
	  $('#next').click();
	});
	$('#clear').click(function() {
	  $('#next').click();
	});
      } else {
	$('#card').text(cards[0]);
	$('#progress').text(cards.length);
	$('#feedback').text('Success!');
      }
    } else {
      var num_penalty = Math.min(0, done_cards.length);
      $('#feedback').append(" for " + cards[0] + ". Penalty of " + num_penalty + (num_penalty == 1 ? " card." : " cards."));
      for (var i = 0; i < num_penalty; i++) {
	cards.push(done_cards.splice(Math.floor(Math.random() * done_cards.length), 1));
      }
      shuffle(cards);
      card_history = [];
      $('#card').text(cards[0]);
      $('#progress').text(cards.length);
      $('#clear').click();
      if (history.length > 0) {
	$('#card_history').append('HISTORY ABOUT TO BE CLEARED');
      }
      clear_history = true;
    }
  });

  $('#clear').click(function() {
    if (clear_history) { $('#card_history').html(''); }
    entered = [];
    $('#entered').html('');
    $('#input').val('');
    $('#input').autocomplete('close');
  });

  $('#enter').click(function() {
    if (clear_history) { $('#card_history').html(''); }
    $('#input').autocomplete('close');
    var input = $('#input').val();
    $('#feedback').html('');
    if (input.toLowerCase() == 'clear' || input.toLowerCase() == 'c') {
      $('#clear').click();
    } else if (input.toLowerCase() == 'next' || input.toLowerCase() == 'n') {
      $('#next').click();
    } else if (input != '') {
      entered.push(input);
      $('#entered').append(input + '</br>');
    }
    $('#input').val('');
    $('#input').focus();
  });
});
