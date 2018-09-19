(function($) {
    $.fn.gplusTip = function(arg) {
        var default_settings = {
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
            },
            $t = $(arg.t),
            obj_offset = $t.offset(),
            obj_width = $t.outerWidth(),
            settings = arg.user_defined_settings ? $.extend(default_settings, arg.user_defined_settings) : default_settings,
            Id = $t.attr("data-gplus_id"),
            gp_key = /* YOUR GOOGLEPLUS KEY GOES HERE */,
            w = $(window),
            ww = w.width(),
            wh = $(window).height(),
            font_awesome_version,
            sign,
            alternator;

        // Constrain size of container
        if (settings.maxWidth > .45) {
            settings.maxWidth = .45;
        } else {
            if (settings.maxWidth < .15) {
                settings.maxWidth = .15;
            }
        }

        if ($("#gp_container").length) {
            removeGplustip();
        }
        
        $("link").each(function() {
            var href = $(this)[0].href;
            if (href.match(/font-awesome-4\./)) {
                font_awesome_version = 4;
                return false;
            } else {
                if (href.match(/fontawesome-free-5\./)) {
                    font_awesome_version = 5;
                    return false;
                }
            }
        });

        var maxWidth = settings.maxWidth * ww,
            apiURL = 'https://www.googleapis.com/plus/v1/people/' + Id + '/activities/public?key=' + gp_key;

        $.ajax({
            type: "GET",
            url: apiURL,
            data: {},
            success: function(response) {
                var i,
                    items = response.items,
                    itemsLength = items.length,
                    len = (itemsLength <= settings.limit) ? itemsLength : settings.limit,
                    formatDate = function(publishedAt) {
                        var date = new Date(publishedAt).toString(),
                            splitDate,
                            formattedDate;

                        splitDate = date.split(" ");
                        splitDate.shift();
                        splitDate.pop();
                        formattedDate = splitDate.join(" ");
                        formattedDate = formattedDate.slice(0, formattedDate.indexOf(" ("));

                        return formattedDate;
                    },
                    ARG = [],
                    ARG_object,
                    stats_object;
                
                for (i = 0; i < len; i++) {
                    if (items[i].kind && (items[i].kind === 'plus#activity')) {
                        if (!settings.filterPosts.length || (settings.filterPosts.indexOf(items[i].url.slice(items[i].url.lastIndexOf("/") + 1)) > -1)) {
                            ARG_object = {};
                            stats_object = {};
                            if (settings.hiddenSections.indexOf("title") === -1) {
                                ARG_object.Title = items[i]['title'];
                            }
                            if (settings.hiddenSections.indexOf("published") === -1) {
                                ARG_object.Published_At = formatDate(items[i]['published']);
                            }
                            if (settings.hiddenSections.indexOf("content") === -1) {
                                ARG_object.Description = items[i]['object']['content'];
                            }
                            if (settings.hiddenSections.indexOf("url") === -1) {
                                ARG_object.Link = items[i]['url'];
                            }
                            if (settings.hiddenSections.indexOf("replies") === -1) {
                                stats_object.Replies = items[i]['object']['replies']['totalItems'];
                            }
                            if (settings.hiddenSections.indexOf("plusones") === -1) {
                                stats_object.Plus_Ones = items[i]['object']['plusoners']['totalItems'];
                            }
                            if (settings.hiddenSections.indexOf("resharers") === -1) {
                                stats_object.Reshares = items[i]['object']['resharers']['totalItems'];
                            }
                            if (!$.isEmptyObject(stats_object)) {
                                ARG_object.Statistics = stats_object;
                            }
                            ARG.push(ARG_object);
                        }
                    }
                }                

                if (ARG.length) {
                    populateContainer(ARG);
                }
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                populateContainer();
            }
        });

        function isSupportedAnimation(type) {
            var supported = ['fadeOut', 'slideUp'];
            return supported.indexOf(type) > -1;
        }

        function populateContainer(ARG) {
            var i, j, key,
                inner = '<h2><b>Posts</b></h2>',
                len = ARG.length,
                list,
                obj,
                stats_symbol_builder = function(key) {
                    var str;
                    if (font_awesome_version) {
                        var map = {
                            v4: {
                                Replies: "fa fa-comment",
                                Plus_Ones: "fa fa-plus",
                                Reshares: "fa fa-share"
                            },
                            v5: {
                                Replies: "fas fa-comment",
                                Plus_Ones: "fas fa-plus",
                                Reshares: "fas fa-share"
                            }
                        };

                        str = '<i class="' + map["v" + font_awesome_version][key] + '"></i>';
                    }

                    return str;
                },
                html_iterator = {
                    html: function(key, val) {
                        return '<b>' + key.replace(/_/g, " ") + ':</b> ' + val;
                    },
                    link: function(key, val) {
                        return '<b>' + key.replace(/_/g, " ") + ':</b> <a href="' + val + '" target="_blank">' + val + '</a>';
                    },
                    statistics: function(key, val) {
                        var entity_map = {
                                Replies: function() {
                                    return stats_symbol_builder('Replies') || '&#128172;';
                                },
                                Plus_Ones: function() {
                                    return stats_symbol_builder('Plus_Ones') || '+';
                                },
                                Reshares: function() {
                                    return stats_symbol_builder('Reshares') || '&#8631;';
                                }
                            },
                            html = '<b>Statistics:</b>&emsp;',
                            v;

                        for(v in val) {
                            html += entity_map[v]() + '&nbsp;' + val[v] + '&emsp;';
                        }

                        html = html.trim();

                        return html;
                    }
                };
            if (ARG) {
                inner += '<ol>';
                
                for (i = 0; i < len; i++) {
                    obj = ARG[i];
                    list = '<li><ul>';
                    for (j in ARG[i]) {
                        if (j !== 'Link' && j !== 'Statistics') {
                            key = 'html';
                        } else {
                            key = j.toLowerCase();
                        }
                        list += '<li><p>' + html_iterator[key](j, ARG[i][j]) + '</p></li>';
                    }
                    list += '</ul></li>';
                    inner+= list;
                }
                
                inner += '</ol>';
            } else {
                inner = '<p>API Error</p>';
            }            

            var append = '<div id="gp_container" style="width:' + maxWidth + 'px;height:' + maxWidth + 'px;background:' + settings.background + '">' + inner + '</div>';
            append += '<div id="gp_arrow"></div>';

            $("body").click(function(e) {
                if (e.target.id !== 'gp_container') {
                    removeGplustip(1);
                }
            }).append(append);

            setTimeout(function() {
                var container = $("#gp_container"),
                    arrow = $("#gp_arrow"),
                    ow = container.outerWidth(),
                    oh = container.outerHeight(),
                    half_oh = .5 * oh,
                    arrow_width = .02 * ow,
                    arrow_base_border = arrow_width + "px solid " + settings.background,
                    applyArrowCSS = function(quadrant) {
                        switch (quadrant) {
                            case 1:
                            case 4:
                                arrow.css({
                                    "border-right": "none",
                                    "border-left": arrow_base_border
                                });
                            break;
                            case 2:
                            case 3:
                                arrow.css({
                                    "border-right": arrow_base_border,
                                    "border-left": "none"
                                });
                            break;
                        }
                    },
                    tip_coordinates = {
                        x: obj_offset.left,
                        y: obj_offset.top
                    },
                    container_coordinates = {},
                    quadrant, xMult, xAdjustment,
                    containerXAdjustment = 0,
                    containerYAdjustment = 0,
                    tipXAdjustment = 0;

                arrow.css({
                    "border": arrow_width + "px solid transparent"
                });

                if (arg.event.pageX <= (.5 * ww)) {
                    quadrant = (arg.event.pageY <= (.5 * wh)) ? 2 : 3;
                    tipXAdjustment = 1;
                } else {
                    quadrant = (arg.event.pageY <= (.5 * wh)) ? 1 : 4;
                    containerXAdjustment = 1;  
                }

                alternator = Math.cos(((2 * quadrant - 1) * Math.PI) / 4);
                sign = (typeof(Math.sign(alternator)) === 'number') ? Math.sign(alternator) : 1;
                xMult = -1 * sign;
                xAdjustment = (xMult * settings.arrowOffset) + (tipXAdjustment * obj_width) + (xMult * containerXAdjustment * arrow_width);
                tip_coordinates.x += xAdjustments;
                
                container_coordinates = {
                    x: tip_coordinates.x + (tipXAdjustment * xMult * arrow_width) + (containerXAdjustment * ow),
                    y: tip_coordinates.y - half_oh
                };
                
                applyArrowCSS(quadrant);
                
                if (quadrant > 2) {
                    if ((container_coordinates.y + oh) > wh) {
                        containerYAdjustment = wh - (container_coordinates.y + oh);
                    }
                } else {
                    if (container_coordinates.y < 0) {
                        containerYAdjustment = -1 * container_coordinates.y;
                    }
                }
                
                container_coordinates.y += containerYAdjustment;

                if (typeof(settings.destroyOnMouseleave) === 'boolean' && settings.destroyOnMouseleave) {
                    $("#gp_container").mouseleave(function() {
                        removeGplustip(1);
                    });
                }

                container.css({
                    "left": container_coordinates.x + "px",
                    "top": container_coordinates.y + "px",
                    "visibility": "visible"
                });
                arrow.css({
                    "left": tip_coordinates.x + "px",
                    "top": tip_coordinates.y + "px",
                    "visibility": "visible"
                });
                
                if(typeof(settings.createCallback) === 'function' && settings.createCallback) {
                    settings.createCallback();
                }
            }, settings.delay);
        }

        var animation_in_progress;
        function removeGplustip(user_destroy) {
            var handleDestroyCallback = function() {
                $("#gp_arrow,#gp_container").remove();
                animation_in_progress = false;
                if (settings.destroyCallback) {
                    settings.destroyCallback();
                }
            };
            if (user_destroy) {
                if (settings.animationOnDestroy) {
                    if (!animation_in_progress) {
                        animation_in_progress = true;
                        $("#gp_arrow").hide();
                        if (isSupportedAnimation(settings.animationOnDestroy)) {
                            $("#gp_container")[settings.animationOnDestroy](500, function() {
                                handleDestroyCallback();
                            });
                        } else {
                            handleDestroyCallback();
                        }
                    }
                } else {
                    handleDestroyCallback();
                }
            } else {
                handleDestroyCallback();
            }
        }
    };
})(jQuery);
