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

var nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var suits = ['S', 'H', 'D', 'C'];
var colors = ['R', 'O', 'Y', 'G', 'B', 'I', 'V'];
var cards = [];
var done_cards = [];
var entered = [];

var rules = {"A .* .*": "uno", "2 .* .*": "deuce", "3 .* .*": "charm", "4 .* .*": "crowd", "5 .* .*": "handful", "7 .* .*": "lucky", "8 .* .*": "ate", "10 .* .*": "countdown", "J .* .*": "royal", "Q .* .*": "royal", "K .* .*": "royal", ".* S .*": "# of spades", ".* H .*": "love", ".* .* R": "rage", ".* .* G": "tea", ".* .* B": "blu $", ".* .* I": "violet", ".* .* V": "indigo", "A S .*": "prime", "Q S .*": "13 points", "A H .*": "<3", "2 H .*": "<3 <3", "3 H .*": "<3 <3 <3", "Q H .*": "off with her head", "4 D .*": "clarity", "4 D .*": "cut", "4 D .*": "carat", "4 D .*": "color", "J D .*": "rich", "Q D .*": "richer", "K D .*": "richest", "A C .*": "odd", "2 C .*": "even", "3 C .*": "odd", "4 C .*": "even", "5 C .*": "odd", "6 C .*": "even", "7 C .*": "odd", "8 C .*": "even", "9 C .*": "odd", "10 C .*": "even", "J C .*": "odd", "Q C .*": "even", "K C .*": "odd", "7 .* R": "game", "10 .* O": "why tho", ".* H R": "blood", ".* D R": "blood", ".* S O": "new black", ".* C O": "new black"};

function displayExpected(expected_rules) {
  $('#feedback').text("Failed! Expected: " + expected_rules.join(", ").toUpperCase());
}

function check(given_card, entered_rules) {
  var matched_rules = [];
  var expected_rules = [];

  var split_card = given_card.split(' ');
  var given_num = split_card[0];
  var given_suit = split_card[1];
  var given_color = split_card[2];

  for (var card in rules) {
    var expected = rules[card];
    if (RegExp(card, 'gi').test(given_card) && expected != '') {
      matched_rules.push(card);
      expected = expected.replace('#', given_num).replace('$', given_suit).replace('%', given_color);
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
  return true;
}

$(document).ready(function() {
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

  $('#input').keyup(function(event) {
    if (event.keyCode === 13) {
      $('#enter').click();
    }
  });

  $('#next').click(function() {
    console.log("Input is:");
    console.log(cards[0]);
    console.log(entered);
    if (check(cards[0], entered)) {
      entered = [];
      $('#entered').html('');
      done_cards.push(cards.shift());
      if (cards.length == 0) {
	$('#feedback').text("Failed! You didn't say LAST CARD. Penalty of 363 cards.");
	$('#card').text("A H B");
	$('#progress').text(364);
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
      var num_penalty = Math.min(5, done_cards.length);
      $('#feedback').append(" for " + cards[0] + ". Penalty of " + num_penalty + (num_penalty == 1 ? " card." : " cards."));
      for (var i = 0; i < num_penalty; i++) {
	cards.push(done_cards.splice(Math.floor(Math.random() * done_cards.length), 1));
      }
      shuffle(cards);
      $('#card').text(cards[0]);
      $('#progress').text(cards.length);
      entered = [];
      $('#entered').html('');
    }
  });

  $('#clear').click(function() {
    entered = [];
    $('#entered').html('');
  });

  $('#enter').click(function() {
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
