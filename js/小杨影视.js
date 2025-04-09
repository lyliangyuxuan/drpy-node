var rule = {
    类型: '影视',
    title: '小杨影视',
    author:'不告诉你',
    desc: '不告诉你',
    host: 'https://xyys.top',
    logo:'https://i-blog.csdnimg.cn/blog_migrate/2621e710a94ab40ba66645d47f296aaf.gif',
    url: '/index.php/vod/show/fyfilter.html',
    searchUrl: '/index.php/vod/search/page/fypage/wd/**.html',
    headers: {'User-Agent': 'MOBILE_UA'},
    searchable:1,quickSearch:1,double:true,timeout:5000,play_parse:true,filterable:1,invalid:true,
    class_name: '电影&电视剧&动漫&短剧&综艺',
    class_url: '/id/1&/id/2&/id/4&/id/5&/id/3',
    filter_url: '{{fl.area}}{{fl.by}}{{fl.class}}{{fl.类型}}/page/fypage{{fl.year}}',
    filter_def: {'/id/1': {类型: '/id/1'},'/id/2': {类型: '/id/2'},'/id/3': {类型: '/id/3'},'/id/4': {类型: '/id/4'},'/id/5': {类型: '/id/5'}},
    预处理: async () => {
        return []
    },
    推荐: async function (tid, pg, filter, extend) {
        let homeFn = rule.一级.bind(this);
        return await homeFn();
    },
    一级: async function (tid, pg, filter, extend) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, 'ul.hl-vod-list li');
        data.forEach((it) => {
            d.push({
                title: pdfh(it, 'a&&title'),
                pic_url: pd(it, '.hl-lazy&&data-original'),
                desc: pdfh(it, '.hl-pic-text&&Text'),
                url: pd(it, 'a&&href'),
            })
        });
        return setResult(d)
    },
    二级: async function (ids) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let VOD = {};
        VOD.vod_name = pdfh(html, '.hl-dc-title&&Text');//名称
        VOD.vod_actor = pdfh(html, '.hl-full-box&&li:eq(2)&&Text');//演员
        VOD.vod_director = pdfh(html, '.hl-full-box&&li:eq(3)&&Text');//导演
        VOD.vod_remarks = pdfh(html, '.hl-full-box&&li:eq(6)&&Text');//备注
        VOD.vod_status = pdfh(html, '.hl-full-box&&li:eq(1)&&Text');//状态
        VOD.vod_content = pdfh(html, '.hl-full-box&&li:eq(11)&&Text');//简介
        let playlist = pdfa(html, 'ul.hl-plays-list');
        let tabs = pdfa(html, 'ul.hl-from-list li');
        let playmap = {};
        tabs.map((item, i) => {
            const form = pdfh(item, 'span&&Text');
            const list = playlist[i];
            const a = pdfa(list, 'body&&a:not(:contains(展开))');
            a.map((it) => {
                let title = pdfh(it, 'a&&Text');
                let urls = pd(it, 'a&&href', input);
                if (!playmap.hasOwnProperty(form)) {
                    playmap[form] = [];
                }
                playmap[form].push(title + "$" + urls);
            });
        });
        VOD.vod_play_from = Object.keys(playmap).join('$$$');
        const urls = Object.values(playmap);
        const playUrls = urls.map((urllist) => {
            return urllist.join("#");
        });
        VOD.vod_play_url = playUrls.join('$$$');
        return VOD;
    },
    搜索: async function (wd, quick, pg) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, '.hl-list-wrap&&ul&&li');
        data.forEach((it) => {
            d.push({
                title: pdfh(it, 'a&&title'),
                pic_url: pd(it, '.hl-lazy&&data-original'),
                desc: pdfh(it, '.hl-pic-text&&Text'),
                url: pd(it, 'a&&href'),
                content: pdfh(it, '.hl-item-content&&p:eq(0)&&Text'),
            })
        });
        return setResult(d);
    },
    lazy: async function (flag, id, flags) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        // log(html);
        html = JSON.parse(html.match(/r player_.*?=(.*?)</)[1]);
        let url = html.url;
        if (html.encrypt == "1") {
            url = unescape(url)
            return {parse: 0, url: url}
        } else if (html.encrypt == "2") {
            url = unescape(base64Decode(url))
            return {parse: 0, url: url}
        }
        if (/m3u8|mp4/.test(url)) {
            input = url
            return {parse: 0, url: input}
        } else {
            return {parse: 1, url: input}
        }
    }
    
}

