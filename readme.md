Theming Store Symfony Backend
=============================

Viewing this file
-----------------

This file is created using [markup notation][1], it can be viewed with any text editor, but is better displayed using [Markdownpad][2] for Windows, [Retext][3] for Linux (available in repositories) or [ByWord][4] for Mac.

Requirements
------------

* Linux server with lamp, php-cli, git

Installation
------------

* Requirements
  
  * Previous steps
  
    `$ sudo apt-get install -y gcc g++ curl openssl libssl-dev rubygems retext php5-intl`

  * Review the rest of the requirements using 

    `$ php app/check.php`
  
  * Compass

    Although it is not required to run the code, it will install SASS and all the other dependencies to compile the styles

    `$ sudo gem install zurb-foundation compass`
  
* Download the code
  `$ git clone git@dev.syscrunch.com:theming-store-symfony.git`
  
* Use composer to get the third party modules

  `$ curl -sS https://getcomposer.org/installer | php`
  `$ php composer.phar install`

* Set the permissions to the cache and log directories
  `$ chmod -R 777 app/logs/`
  `$ chmod -R 777 app/cache/`

[1]: http://daringfireball.net/projects/markdown/
[2]: http://markdownpad.com/
[3]: http://sourceforge.net/p/retext/home/ReText/
[4]: http://bywordapp.com/
