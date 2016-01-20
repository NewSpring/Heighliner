<p align="center" >
  <a href="http://newspring.cc">
    <img src="https://s3.amazonaws.com/ns.images/newspring/icons/newspring-church-logo-black.png" alt="NewSpring Church" title="NewSpring Church" />
  </a>
</p>

Heighliner
=======================

A graphQL server for NewSpring Church

### Prerequistes

- [ ] docker, docker-machine, and docker-compose installed (brew install <name>)
- [ ] docker-machine up and running
- [ ] ee database

### Setup

```
git clone https://github.com/NewSpring/Heighliner.git
cd Heighliner
npm start
```

Fire up your favorite mysql tool and import your EE db into ee_local

> Mongo support coming soon (currently pulls from alpha.newspring.io)

Open your browser to your docker url (typically [here](http://192.168.99.100/))

Profit


#### Sample Query

```
{
	james: person(id: 90818) {
    ...people
  }

  pinky: person(id: 305492) {
    ...people
  }

  articles: allContent(channel: "articles", limit: 2) {
    title
    status
    content {
      body
      images {
        fileName
        fileType
        fileLabel
        s3
        cloudfront
      }
      tags
    }
  }
}

fragment people on Person {
	firstName
  lastName
  email
  likes {
    title
  }
}
```
