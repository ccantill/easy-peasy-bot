/**
 * This imports papio scores from a Slack workspace export. Point the dir variable to the directory for the relevant channel.
 */

let dir = '/home/christoph/foosball';
let fs = require('fs');
let path = require('path');

function extractGames(input) {
    return input.filter(m => m.bot_id === 'BBN266QAD' && m.attachments && m.attachments[0].fallback.match(/^(Red|Blue) team won:/)).map(
        m => {
            let teams = m.attachments.map(a => {
                    let match = a.fallback.match(/^\[G\] (.*)\: \*([0-9]+)\* goals.*\n\[F\] (.*)\: \*([0-9]+)\* goals.*$/);
                    if(match) {
                        let [,g_name, g_score, f_name, f_score] = match;
                        return {
                            color: a.color,
                            score: g_score + f_score,
                            goalie: {
                                name: g_name,
                                score: g_score
                            },
                            forward: {
                                name: f_name,
                                score: f_score
                            }
                        };
                    }
                }
            ).filter(n => n);

            let red = teams.filter(t => t.color === 'EE0A0A')[0];
            let blue = teams.filter(t => t.color === '1661ED')[0];

            if(!red || !blue) return;

            return {
                timestamp: new Date(m.ts * 1000),
                winner: red.score > blue.score ? "red" : "blue",
                red,
                blue
            }
        }
    ).filter(n => n);
}

let files = fs.readdirSync(dir);
let allGames = files.map(f => extractGames(require(path.resolve(dir, f)))).reduce((a,b) => a.concat(b), []);

console.log(JSON.stringify(allGames, null, 4));