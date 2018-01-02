// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const functions = require('firebase-functions');

exports.yourAction = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  const stringAmmendments = {one:1, two:2, to:2, too:2, three:3, free:3, four:4, for:4, five:5, six:6, seven:7, eight:8, ate:8, nine:9, oh:0, zero:0 }
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  // Fulfill action business logic
  function responseHandler(app) {
    // Complete your fulfillment logic and send a response
    app.ask('<speak>Hello, welcome to the digit memory test. Say start to begin.</speak>');
  }

  function unknownHandler(app){
    let userInput = request.body.result;
    console.log('------user input '+ userInput);
  }

  function startHandler(app) {
    let newSequence = randomArray(1, 9);
    app.setContext("digitcontext", null, { "context_numbers": newSequence.join('') });
    app.ask('<speak>Get ready to go.<break time="2s"/>' + newSequence.join(' ') + '</speak>');
  }

  function quitHandler(app){
    app.tell('Goodbye!');
  }

  function testHandler(app) {
    // if there is a context to match
    if (app.getContext("digitcontext")) {
      let numbersToMatch = app.getContext("digitcontext").parameters.context_numbers.split("").reverse().join('');
      console.log('------numbers to match '+ numbersToMatch);

      let currentLevel = numbersToMatch.length;
      console.log('request==='+request.body.result.resolvedQuery);
      let userInput = request.body.result.resolvedQuery.replace(/\s/g, "");
      userInput = cleanInput(userInput);
      console.log('------user input '+ userInput);
      if (numbersToMatch == userInput) {
        // the context sequence and user input match
        console.log("correct answer");
        currentLevel++;
        let newSequence = randomArray(currentLevel, 9);
        app.setContext("digitcontext", 10, { "context_numbers": newSequence.join('') });
        app.ask('<speak><audio src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"/>'+ newSequence.join(' ') + '</speak>');
      }
      else {
        // the context sequence and user input don't match
        app.setContext("GameEndContext", 1);
        app.setContext("digitcontext", 0);
        app.ask('<speak> <audio src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"/><s>Sorry, that isn\'t correct.</s><s> You reached level' + (currentLevel -1) + '.</s><s>Would you like to have another go?</s></speak>');
      }
    }
  }

  function cleanInput(theInput){
    const itemsToCheck = new Map([["one","1"] , ["two","2"], ["to","2"], ["too","2"], ["three","3"], ["free","3"], ["four","4"], ["for","4"], ["five","5"], ["six","6"], ["seven","7"], ["eight","8"], ["ate","8"], ["nine","9"], ["oh","0"], ["zero","0"] ]);
    for (const entry of itemsToCheck.entries()) {
      theInput = theInput.replace(new RegExp(entry[0],'g'), entry[1]);
      console.log("----------------");
      console.log(theInput);
      console.log("----------------");
    }
    return theInput;
  }

  function randomArray(length, max) {
    return Array.apply(null, Array(length)).map(function () {
      return Math.round(Math.random() * max);
    });
  }

  const actionMap = new Map();
  actionMap.set('input.welcome', responseHandler);
  actionMap.set('input.test', testHandler);
  actionMap.set('input.unknown', unknownHandler);
  actionMap.set('START_ANSWER_ACTION', startHandler);
  actionMap.set('END_GAME_ACTION', quitHandler);


  app.handleRequest(actionMap);
});


