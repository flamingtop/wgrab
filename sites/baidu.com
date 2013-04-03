plugins['baidu.com'] = {
    url: 'http://baidu.com',
    process: function() {

        this.then(function() {
            this.fill('form[name=f]', {'wd': input.q}, true);
        });

        this.then(function() {
                var data = this.evaluate(function() {
                    var things = [];
                    $('h3.t a').each(function() {
                        things.push({
                            title: $(this).text(),
                            link: $(this).attr('href')
                        });
                    });
                    return things;
                });
                output.results['baidu.com'] = data;
        });

    }
};


