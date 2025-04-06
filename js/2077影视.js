var rule = {
    类型:'影视',
    title:'2077影视',
    author:'不告诉你',
    logo:'https://i-blog.csdnimg.cn/blog_migrate/2621e710a94ab40ba66645d47f296aaf.gif',
    host:'https://www.m2077.com',
    url: '/vod-show/fyclass--------fypage---/',
    searchUrl: '/vod-search/**----------fypage---/',
    searchable:1,quickSearch:1,double:false,timeout:5000,play_parse:true,filterable:1,invalid:true,
    class_name:'电影&电视剧&动漫&综艺&短剧',
    class_url:'1&2&4&3&41',
    filter_url:'{{fl.类型}}-{{fl.area}}-{{fl.by}}-{{fl.class}}-----fypage---{{fl.year}}',
    filter_def:{'1':{类型:'1'},'2':{类型:'2'},'3':{类型:'3'},'4':{类型:'4'}},
    预处理: async () => {return []},
    推荐: async function (tid, pg, filter, extend) {
        let homeFn = rule.一级.bind(this);
        return await homeFn();
    },
    一级: async function (tid, pg, filter, extend) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let d = [];
        let data = pdfa(html, '.module-items .module-poster-item');
        data.forEach((it) => {
            d.push({
                title: pdfh(it, 'a&&title'),
                pic_url: pd(it, '.lazyload&&data-original'),
                desc: pdfh(it, '.module-item-note&&Text'),
                url: pd(it, 'a&&href'),
            })
        });
        return setResult(d)
    },
    二级: async function (ids) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
        let VOD = {};
        VOD.vod_name = pdfh(html, '.module-info-main&&h1&&Text');//名称
        VOD.vod_actor = pdfh(html, '.module-info-main&&.module-info-item:eq(3)&&Text');//演员
        VOD.vod_director = pdfh(html, '.module-info-main&&.module-info-item:eq(2)&&Text');//导演
        VOD.vod_remarks = pdfh(html, '.module-info-main&&.module-info-item:eq(5)&&Text');//备注
        VOD.vod_status = pdfh(html, '.module-info-main&&.module-info-item:eq(7)&&Text');//状态
        VOD.vod_content = pdfh(html, '.module-info-introduction&&Text');//简介
        let playlist = pdfa(html, '.module-play-list');
        let tabs = pdfa(html, '#mobile-tab-box&&.module-tab-item');
        let playmap = {};
        tabs.map((item, i) => {
            const form = `${pdfh(item, 'Text')}_${i}`;
            const list = playlist[i];
            const a = pdfa(list, 'body&&a:not(:contains(排序))');
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
        let data = pdfa(html, '.module-items .module-card-item');
        data.forEach((it) => {
            d.push({
                title: pdfh(it, 'img&&alt'),
                pic_url: pd(it, '.lazyload&&data-original'),
                desc: pdfh(it, '.module-item-note&&Text'),
                url: pd(it, 'a&&href'),
                content: pdfh(it, '.module-info-item&&Text'),
            })
        });
        return setResult(d);
    },
   lazy: async function (flag, id, flags) {
        let {input, pdfa, pdfh, pd} = this;
        let html = await request(input);
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
             return {parse: 0, url: input}
         }
    },
    filter: {
    }
}
