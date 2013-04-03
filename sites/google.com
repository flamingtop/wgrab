plugins['google.com'] = {
    url: 'http://google.com',
    process: function() {
        
        this.then(function() {
            this.fill('form', {'q': input.q}, true);
        });

        this.then(function() {
            var data = this.evaluate(function() {
                var things = [];
                $('.r .l').each(function() {
                    things.push({
                        title: $(this).text(),
                        link: $(this).attr('href')
                    });
                });
                return things;
            });
            output.results['google.com'] = data;
        });

    }

};


