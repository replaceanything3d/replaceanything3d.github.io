var VCSJS = (function () {
	return {
	
		// Some options, maybe more in the future
		options: {
			classNames: {
				wrapper: 'vcs_wrapper',
				slider: 'vcs_slider',
				video: 'vcs_video',
				video_left: 'vcs_video_l',
				video_right: 'vcs_video_r',
				loading: 'vcs_loading'
			}
		},
	
		/**
		 * Document ready listener
		 */
		init: function() {
			var self = this;
			window.addEventListener( 'load', self.start );
		},
		
		/**
		 * Let's init the whole thing
		 */
		start: function() {
			VCSJS.getSliders();
		},
		
		/**
		 * Get sliders
		 */
		getSliders: function() {
			this.vcsElements = document.getElementsByClassName( this.options.classNames.wrapper );
			this.initSliders();
		},
		
		/**
		 * Init sliders
		 */
		initSliders: function() {
			for( var i = 0; i < this.vcsElements.length; i++ ) {			
				this.addSliderMarkup( this.vcsElements[ i ] );
			}
		},
		
		/**
		 * Add additional markup
		 *
		 * @param	wrapper object
		 */
		addSliderMarkup: function( wrapper ) {
			
			// Add loading stuff			
			var loadingElement = document.createElement( 'div' );
			loadingElement.className = this.options.classNames.loading;
			loadingElement.innerHTML = 'Loading ...';
			wrapper.appendChild( loadingElement );
			
			var docFrag = document.createDocumentFragment();
			
			// Add slider bar
			var sliderElement = document.createElement( 'div' );
			var sliderSpan = document.createElement( 'span' );
			
			sliderElement.className = this.options.classNames.slider;
			sliderSpan.innerHTML = '&harr;';
			
			sliderElement.appendChild( sliderSpan );			
			docFrag.appendChild( sliderElement );
			
			// Add video wrapper
			var videoElements = wrapper.getElementsByTagName( 'video' );
			if( videoElements.length == 2 ) {
			
				// Generate random string for use as an identifier
				var videoId = Math.random().toString(36).substring(7);
			
				for( var i = 0; i < 2; i++ ) {
					
					// Create the wrapper element
					var videoWrapper = document.createElement( 'div' );
					var videoElement = videoElements[ 0 ];
					videoElement.id = videoId + '_' + i;

				    // Add classnames to wrapper
					if( i  == 0 ) {					
						videoWrapper.className = this.options.classNames.video + ' ' + this.options.classNames.video_left;
					} else {
						videoWrapper.className = this.options.classNames.video + ' ' + this.options.classNames.video_right;
					}
					
					// Add it to the doc fragment
					wrapper.removeChild( videoElements[ 0 ] );
					videoWrapper.appendChild( videoElement );
					docFrag.appendChild( videoWrapper );					
				}				
				
				// Append everything				
				wrapper.appendChild( docFrag );
				
				// Add pseudo element for fixed aspect ratio
				var pseudoElement = document.createElement( 'div' );
				var ar = this.getAr( wrapper );
				
				pseudoElement.style.paddingBottom = ar + '%';				
				wrapper.appendChild( pseudoElement );	
						
				// Add some event listeners finally
				this.addListeners( wrapper );						
			} else {
				console.log( 'vcsjs-error: there are more or less than 2 video elements in this wrapper.' );
			}
			
			return true;
		},
		
		/**
		 * Get aspect ratio
		 */
		getAr: function( wrapper ) {
			var video = wrapper.getElementsByTagName( 'video' )[0];			
			var ar = video.videoHeight / video.videoWidth * 100;
			return ar;
		},
		
		/**
		 * Add event listeners
		 */
		addListeners: function( wrapper ) {
			var self = this;
			// Mousedown
			wrapper.getElementsByClassName( this.options.classNames.slider )[0].firstChild.addEventListener( 'mousedown', function() {
				wrapper.addEventListener( 'mousemove', VCSJS.slide, true );
			}, false );	
			// Mouseup	
			window.addEventListener( 'mouseup', function() {
				wrapper.removeEventListener( 'mousemove', VCSJS.slide, true );
			}, false );			
			var videos = wrapper.getElementsByTagName( 'video' );
		    var video = videos[0];
		    // Add Click-Handler for play/pause
		    for( var i = 0; i < videos.length; i++ ) {
			    videos[i].parentNode.addEventListener( 'click' , function() {
					var video = this.getElementsByTagName('video')[0];
					var wrapper = this.parentNode;
					var videos = wrapper.getElementsByTagName('video');
					if( video.paused ) {
						for( var j = 0; j < videos.length; j++ ) {
							videos[j].play();
							if( typeof jQuery !== "undefined" ) {
								if( typeof jQuery.synchronizeVideos === "function" ) {
									jQuery( document ).trigger( "sjs:play" );
								}
							}
						}
					} else {
						for( var j = 0; j < videos.length; j++ ) {
							videos[j].pause();
							if( typeof jQuery !== "undefined" ) {
								if( typeof jQuery.synchronizeVideos === "function" ) {
									jQuery( document ).trigger( "sjs:pause" );
								}
							}
						}
					}	   
			    } );
		    }
		    
		    // Loop the videos
		    if( wrapper.getAttribute( 'data-loop' ) == "true" ) {
			   video.addEventListener( 'ended', function () {
				    self.playVideos( wrapper );
			    }, false );	
		    }
		    // Sync the videos or just hit play
		    this.syncVideos( wrapper );
		},
		
		/**
		 * Use synchronize.js
		 */
		syncVideos: function( wrapper ) {
			if( typeof jQuery !== "undefined" ) {
				if( typeof jQuery.synchronizeVideos === "function" ) {
					var videos = wrapper.getElementsByTagName( 'video' );
					videos[0].loop = true;
					videos[1].loop = true;
					jQuery.synchronizeVideos( 0, videos[0].id, videos[1].id );
					jQuery( document ).trigger( "sjs:play" );
					var self = this;
					setTimeout( function() { self.showSlider( wrapper ); }, 100 );
				}
			} else {
				var self = this;
				this.playVideos( wrapper );
				setTimeout( function() { self.showSlider( wrapper ); }, 100 );
			}
		},
		
		/**
		 * Show the slider
		 */
		showSlider: function( wrapper ) {
			var video = wrapper.getElementsByTagName( 'video' )[0];
			wrapper.getElementsByClassName( this.options.classNames.loading )[0].style.opacity = 0;
			wrapper.style.maxHeight = video.videoHeight + 10 + 'px';
			wrapper.style.maxWidth = video.videoWidth + 'px';
		},
		
		/**
		 * Move the slider
		 */
		slide: function( e ) {
			var clientRect = this.getClientRects()[0];
			var pos = (e.clientX - clientRect.left) / clientRect.width * 100;
			var slider = this.getElementsByClassName( VCSJS.options.classNames.slider )[0];
			slider.style.left = pos + '%';
			this.getElementsByClassName( VCSJS.options.classNames.video_left )[0].style.width = pos + '%';
			var video_right = this.getElementsByClassName( VCSJS.options.classNames.video_right )[0];
			video_right.style.width = (100 - pos) + '%';
			video_right.style.left = pos + '%';
			var videoElRight = video_right.getElementsByTagName('video')[0];			
			videoElRight.style.left = -slider.getClientRects()[0].left+clientRect.left + 'px';
		},
		
		/**
		 * Play the videos
		 */
		playVideos: function( wrapper ) {			
			var videos = wrapper.getElementsByTagName( 'video' );
			for( var i = 0; i < videos.length; i++ ) {
				videos[ i ].currentTime = 0;
				if( typeof jQuery !== "undefined" ) {
					if( typeof jQuery.synchronizeVideos === "function" ) {
						jQuery( document ).trigger( "sjs:play" );
					}
				} else {
					videos[ i ].play();
				}				
			}
		},
	
	}
			
})();

VCSJS.init();