                  )}
                </div>

                {/* Class Photo Section with Upload Functionality */}
                <div 
                  onClick={triggerPhotoUpload}
                  style={{
                    position: 'absolute',
                    top: '82px',
                    left: '12px',
                    width: '60px',
                    height: '45px',
                    background: 'linear-gradient(135deg, #F5DEB3 0%, #DEB887 50%, #CD853F 100%)',
                    border: '1px solid #8B4513',
                    borderRadius: '1px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '7px',
                    color: '#654321',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    textShadow: '0 0.5px 1px rgba(255,255,255,0.5)',
                    position: 'relative'
                  }}
                >
                  <div style={{ marginBottom: '3px', fontWeight: 'bold' }}>📸 UPLOAD PHOTO</div>
                  {uploadedPhoto ? (
                    <>
                      <img 
                        src={uploadedPhoto} 
                        alt="Profile" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(45deg, rgba(139,69,19,0.1) 0%, transparent 30%, transparent 70%, rgba(139,69,19,0.1) 100%)`,
                        pointerEvents: 'none'
                      }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(220,20,60,0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          fontSize: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}
                        title="Remove photo"
                      >×</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '10px', marginBottom: '3px' }}>📷</div>
                      <div style={{ fontSize: '6px', fontStyle: 'italic', opacity: 0.8 }}>
                        Click to add your photo
                      </div>
                    </>
                  )}
                  
                  {/* Photo corner tabs */}
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '5px',
                    width: '6px',
                    height: '6px',
                    background: 'rgba(245,222,179,0.7)',
                    transform: 'rotate(45deg)',
                    border: '0.5px solid #DEB887'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '5px',
                    width: '6px',
                    height: '6px',
                    background: 'rgba(245,222,179,0.7)',
                    transform: 'rotate(45deg)',
                    border: '0.5px solid #DEB887'
                  }} />
