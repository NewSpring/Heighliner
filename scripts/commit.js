// a mix between https://github.com/commitizen/cz-conventional-changelog and
// https://github.com/commitizen/cz-jira-smart-commit

"format cjs";

var wrap = require('word-wrap');

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = {

  // When a user runs `git cz`, prompter will
  // be executed. We pass you cz, which currently
  // is just an instance of inquirer.js. Using
  // this you can ask questions and get answers.
  //
  // The commit callback should be executed when
  // you're ready to send back a commit template
  // to git.
  //
  // By default, we'll de-indent your commit
  // template and will keep empty lines.
  prompter: function(cz, commit) {
    console.log('\nLine 1 will be cropped at 100 characters. All other lines will be wrapped after 100 characters.\n');

    // Let's ask some questions of the user
    // so that we can populate our commit
    // template.
    //
    // See inquirer.js docs for specifics.
    // You can also opt to use another input
    // collection library if you prefer.
    cz.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select the type of change that you\'re committing:',
        choices: [
        {
          name: 'feat:     A new feature',
          value: 'feat'
        }, {
          name: 'fix:      A bug fix',
          value: 'fix'
        }, {
          name: 'test:     Adding missing tests',
          value: 'test'
        }, {
          name: 'style:    Changes that do not affect the meaning of the code\n            (white-space, formatting, missing semi-colons, etc)',
          value: 'style'
        }, {
          name: 'refactor: A code change that neither fixes a bug or adds a feature',
          value: 'refactor'
        }, {
          name: 'docs:     Documentation only changes',
          value: 'docs'
        }, {
          name: 'perf:     A code change that improves performance',
          value: 'perf'
        }, {
          name: 'chore:    Changes to the build process or auxiliary tools\n            and libraries such as documentation generation',
          value: 'chore'
        }]
      }, {
        type: 'input',
        name: 'issues',
        message: 'Jira Issue ID(s) (required):\n',
      }, {
      type: 'input',
      name: 'subject',
      message: 'Write a short description of the change (required):\n',
      }, {
        type: 'input',
        name: 'body',
        message: 'Provide a longer description of the change [Sent to JIRA] (optional):\n'
      }, {
        type: 'confirm',
        name: 'ci',
        message: 'Run this build on CI?\n'
      }
    ]).then(function(answers) {
      try {
        var wrapOptions = {
          trim: true,
          newline: '\n',
          indent:'',
          width: 100
        };

        var issues = answers.issues.trim();
        var body = answers.body ? '#comment ' + answers.body.trim(): '';
        var ci = answers.ci ? '' : ' [ci skip]';

        // Hard limit this line
        var head = answers.type + ': ' + answers.subject + ' ' + issues + ci;
        if (body) head = head + ' ' + body;

        // Wrap these lines at 100 characters
        var body = wrap(body, wrapOptions);
        var footer = wrap(answers.footer, wrapOptions);

        commit(head + '\n\n' + body + '\n\n' + footer);
      } catch (e) {
        console.log("COMMIT ERROR: ", e);
      }

    });
  }
}