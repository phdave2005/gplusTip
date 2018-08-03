/*
 * gplusTip - A tooltip populated by data pulled from the Google+ API
 * Copyright 2018 David Partyka
 * www.cssburner.com
 *
 * Version 1.0
 *
 * The gplusTip jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
 
   The gplusTip tooltip is a pure jQuery-based tooltip which first makes a Google+ API request to pull data, and then uses this data to populate the tooltip before rendering it. As such, you must add your Google+ API key to replace the comment (in the accompanying JS file) that says " YOUR GOOGLEPLUS KEY GOES HERE "; gplusTip is enabled to use all default values by simply invoking it as a callback as follows:
    
    $(selector).on("mouseenter", function () {
        $(this).gplusTip(arg);
    }); // other events, e.g., click can also be used
    
where the minimal object (arg) that is passed is 
    
    arg = {
      event: e,
      t: this
    };
 
The selector must pass an attribute: **data-user_id**
where this attribute is the Google+ user id, e.g. <div data-user_id="102463414105368446603"></div>

which can be found as the numeric string at the end of the URL for when clicking on the nav menu 'Profile'. 
 
The default options can be overwritten by also passing "user_defined_settings":

     arg = {
      event: e,
      t: this,
      user_defined_settings: {
          animationOnDestroy: false,
          arrowOffset: 3,
          background: '#cdcdcd',
          createCallback: false,
          delay: 250,
          destroyCallback: false,
          destroyOnMouseleave: true,
          filterPosts: [],
          hiddenSections: [],
          limit: 5,
          maxWidth: .25
      }
    };
   
    
The supported values of each user defined setting is as follows:

    animationOnDestroy:
        false: The gplusTip container will simply be removed from the DOM
        'fadeOut': the container will fadeOut over 500ms, and then be removed
        'slideUp': the container will slideUp over 500ms, and then be removed

    arrowOffset:
        <number>: The number of pixel to offset the container and arrow from the event which calls gplusTip() in callback
  
    background:
        <color> or <image>: The background for the container
  
    createCallback:
        <function>: A function to call right after the tooltip is rendered
  
    delay:
        <number>: The milliseconds to delay before rendering the tooltip

    destroyCallback:
        <function>: A function to call right after the tooltip is removed from the DOM

    destroyOnMouseleave:
        <boolean>: If tooltip is moused over, it will be destroyed on mouseleave (if set to true, otherwise not destroyed)

    filterPosts:
        <array>: If included, only posts which correspond to the 11-character post_id (found at end of URL when clicking on arrow at upper right of a post) will be used to populate the tooltip

    hiddenSections:
        <array>: If included in the array, these sections will be excluded in the tooltip output. Possible values are: "title", "published", "content", "url", "replies", "plusones", "resharers"

    limit:
        <number>: Set the number of returned records to display in the tooltip, otherwise 5 records will be included in output (-1 for all)

    maxWidth:
        <number>: relative to window width, where window width = 1, will be constrained to be between .15 and .45

