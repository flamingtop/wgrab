

plugins['infoq.com'] = {
    url: 'http://infoq.com',
    process: function() {
        
        this.then(function() {
            this.fill('form#cse-search-box', {
              search: input.q,
              queryString: input.q,
              searchOrder: 'relevancy'
            }, true);
        });

        this.then(function() {
            var data = this.evaluate(function() {

              console.log(document.title);
              console.log(location.href);
              
                var things = [];
                $('.entry > h1 > a').each(function() {
                    things.push({
                        title: $(this).text(),
                        link: $(this).attr('href')
                    });
                });
                return things;
            });
            output.results['infoq.com'] = data;
        });

    }

};


