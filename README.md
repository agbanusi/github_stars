
# github_stars
## Introduction
This app ranks the repos created in github within a particular timeframe based on their stars.
## Features


* It lists the most starred Github repos that were created in the last 30 days by default, you can change the days if you wish to

* It implements Infinite Scrolling (pagination)

* It uses parcel as its bundler.

![The webFrame of the App](https://github.com/agbanusi/github_stars/blob/master/src/github-repos_websequence.png)

## How to Use

First paste this code in your terminal:

```
git clone https://github.com/agbanusi/github_stars.git githubStars
```

then you do:

```
cd githubStars
```

Because of its use of parcel instead of create react app, you would need to install parcel.

It is already prepackaged for you, just paste this code in your terminal:

```
npm run dev
```

If you already have parcel bundler installed in your system then just run with:

```
npm run start
```

If you then want to use for production:

```
npm run build &&cd dist
```

Then go to http://localhost:1234 and It looks like this in the end:

![picture](https://github.com/agbanusi/github_stars/blob/master/src/2020-08-21%2001_26_42-Popular%20Github%20Repos%20App.png)

You can also test it live here: https://github-popular.netlify.app/
