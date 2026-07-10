# Forest Shuffle scoring web app 

This is a web app for scoring for the game forest shuffle. You can take a picture of your forest, and potentially modify by hand your forest afterwards.

## The game is available at : https://grosgabriel.github.io/forest-shuffle/

## How it works

The web app uses [glaures](https://github.com/glaures/forestshuffle) scoring system, connected to [NINI1988](https://github.com/NINI1988/ForestDetector) YOLO model for computer vision.

In addition, a svelte ui system makes it possible to modify the output of the YOLO system according to user expectation.

Everything works in the browser, there is no need for a server.


## Later updates

I plan to :
- Add a better UI design
- Optimize the YOLO model (possibly make it through a server)
- Create accounts and database to save previous games (+qrcode to share forest between players in the same game)
- --Enhance the way to take a picture of the forest: instead of taking one picture of the full forest, permits multiple smaller ones-- (done)

If you know how to make (or already have done) a better YOLO model with all cards for every extensions, please share it with me !
