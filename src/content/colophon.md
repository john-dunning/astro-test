---
title: Colophon
---

> **Note:** This is how the site used to be built, using good ol' php.  It's now generated statically with Astro and hosted on GitHub Pages.  The pages for Fireworks commands are still generated from the original `.mxi` files, though.

The Fireworks section of my site is dynamically generated using just a few custom php templates.  When I first started distributing Fireworks extensions years ago, I simply listed them all on a single, static page.  I had to hand-edit the HTML whenever I wanted to post something new.  This was obviously somewhat inconvenient, so it often took me awhile to get around to updating the site.  

To try to improve the frequency at which I posted new extensions, I eventually created a system that would let me update the site with as little effort as possible.  The flow now is basically:

1. Package the extension using Extension Manager 
2. Upload the packaged files to a special directory
3. Et voilà, a page for the extension magically appears

It's so easy, even someone as lazy as I am has no excuse to upload extensions frequently!  For the nitty gritty details, read on. 


## Packaging Fireworks extensions

To understand how this system works, it's helpful to have some background on how Fireworks extensions are packaged.  The Extension Manager app that comes with Fireworks is used to install extensions from an .mxp file, which is similar to a .zip archive.  The Extension Manager is also used to build these packages from an .mxi source file.  This XML document points to the files that should be included in the package and specifies the path where they should be installed.  It also includes metadata about the extension, like the name, a description, and so on.  

Since I needed to create one of these .mxi files for each extension anyway, I realized I could automatically generate the extension's webpage from it, greatly simplifying the maintenance of the site. 

The Extension Manager requires that .mxp file names be less than 32 characters, due to ancient filename limits on the Mac.  So I had gotten into the habit of creating the file names without any spaces and then appending the version number, e.g., `SmartPunch-031.mxp`.  This naming convention turned out to be quite convenient, as space-less names work well in URLs and the version number identifies which file is the most recent.  After packaging a new extension, I can just upload the corresponding .mxp and .mxi files to a specific directory on my server, which serves as the database for the entire site.


## Generating the list of available extensions

The main page of my Fireworks site, <https://johndunning.com/fireworks>, lists all of the extensions available for download, with the most recent on top.  To generate this list, a php script loops through all the .mxi files, extracting the extension name and version from each file name and adding it to an associative array.  If the version is newer than a previously found one, it replaces the older version.  This lets me upload newer extensions without having to delete the older versions, which are ignored (told you I was lazy!). 

After the most recent version of each extension has been identified, the script parses its associated .mxi file and extracts certain data.  The [.mxi XML format](https://help.adobe.com/en_US/ExtensionManager/2.0/mxi_file_format.pdf) contains some useful metadata, such as the full name of the extension and its version number, but it doesn't include the date it was created.  The Extension Manager ignores attributes and elements it doesn't understand, however, so I add a timestamp during the build process.  The php script uses this date to sort the list of extensions.  

The summary paragraph shown for each extension is pulled from a `<summary>` element in the .mxi file, which is a custom element I add to most of my extensions.  Some of the older .mxi files don't have that element, so in that case the script just uses the first paragraph of the `<description>` element.

The site's [RSS feed](https://johndunning.com/fireworks/feed) is generated in a similar way, showing the `<summary>` elements from the 15 most recently uploaded extensions.  


## Generating the about pages

Each extension has its own description page at a permanent URL, like <https://johndunning.com/fireworks/about/SmartResize>.  Through the magic of [.htaccess]( https://en.wikipedia.org/wiki/Htaccess), that URL doesn't point to an actual HTML page.  Rather, the extension name following the `/about/` is extracted and passed to a php template that renders the page.  Like the summary list page, this php template builds a list of all the available .mxi files and finds the one requested by the "about" URL.  It then uses this data to generate the page.  

The text in the .mxi file's `<description>` element provides the bulk of the page content.  The Extension Manager displays this description as plain text when you select an installed extension, so it can't contain any HTML tags.  However, I do embed some formatting hints in the description using [Markdown](https://daringfireball.net/projects/markdown/syntax), which is a plain text formatting syntax.  (This colophon also uses Markdown.)  The description is converted to HTML markup by [PHP Markdown](https://michelf.com/projects/php-markdown/extra/), and then inserted into the page.  The Markdown conversion is particularly useful for code snippets, which are rendered in a monospaced font in their own blocks.

Some pages display a screenshot or screencast of the extension.  These are included by creating a .inc file with the same name as the extension, like `SmartPunch.inc`.  (The .inc is just an arbitrary extension I made up.)  This file contains a snippet of HTML to display an image or Flash player.  The about page template looks for a matching .inc file and inserts it into the page if found.

Near the bottom of the extension page is a list of the individual commands contained in the package.  Since, by definition, the .mxi file contains a list of all the files in the .mxp, this list is easily created by looping through the `<file>` elements in the XML. 

The comments section at the very bottom is provided by what used to be called JS-Kit, and is now [Echo](https://aboutecho.com/).  A snippet of JavaScript pulls in the comment data stored on their site and provides the interface for adding new comments.  Getting the CSS to make the comment stream look good took a fair amount of fiddling, and it's sometimes slow to render.  The service started out free, and my site seems to be grandfathered in, but is now premium-only for new sites.  I'm not sure I'd use it for a new domain, but it works okay for now. 

That's basically all there is to the site: a few php templates and a directory of .mxi and .mxp files.  Now back to some Fireworks hacking...
