plugins['news.ycombinator.com'] = {
    url: 'http://news.ycombinator.com',
    process: function() {

        this.then(function() {
            this.fill('form', {q: input.q}, true);
        });

        this.then(function() {

              var that = this;

              this.waitForSelector('.content-story-title', function() {

                  var data = that.evaluate(function() {
                      var things = [];
                      $('.content-story-title').each(function() {
                        things.push({
                            title: $(this).html(),
                            link: $(this).attr('href')
                        });
                      });
                      return things;
                  });

                  RESULTS['news.ycombinator.com'] = data;

              });

        });

    }
};


