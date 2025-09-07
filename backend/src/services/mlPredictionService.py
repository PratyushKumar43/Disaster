"""
ML Prediction Service - JSON only output for Node.js integration
"""

import sys
import json
import logging
import os

# Suppress all logging output for clean JSON
logging.disable(logging.CRITICAL)

# Redirect stderr to devnull to prevent any error messages
if hasattr(os, 'devnull'):
    devnull = open(os.devnull, 'w')
    sys.stderr = devnull

try:
    from realMLModelService import FireRiskMLService
    
    def predict_fire_risk(latitude, longitude):
        """
        Predict fire risk and return JSON result only
        
        Args:
            latitude: float
            longitude: float
            
        Returns:
            JSON string with prediction result
        """
        try:
            # Initialize the ML service
            service = FireRiskMLService()
            
            # Create location dictionary as expected by the method
            location = {'latitude': latitude, 'longitude': longitude}
            
            # Get prediction
            result = service.predict_fire_risk_with_earth_engine(location)
            
            # Return only JSON, no extra output
            return json.dumps(result)
            
        except Exception as e:
            # Return error as JSON
            error_result = {
                'error': str(e),
                'riskScore': 0.2,
                'riskLevel': 'LOW',
                'confidence': 0.5,
                'source': 'ErrorFallback'
            }
            return json.dumps(error_result)
    
    if __name__ == '__main__':
        if len(sys.argv) != 3:
            print(json.dumps({'error': 'Usage: python mlPredictionService.py <latitude> <longitude>'}))
            sys.exit(1)
        
        try:
            latitude = float(sys.argv[1])
            longitude = float(sys.argv[2])
            result = predict_fire_risk(latitude, longitude)
            print(result)
        except ValueError:
            print(json.dumps({'error': 'Invalid coordinates provided'}))
            sys.exit(1)
        except Exception as e:
            print(json.dumps({'error': f'Prediction failed: {str(e)}'}))
            sys.exit(1)

except ImportError:
    # Fallback if realMLModelService is not available
    def basic_prediction(latitude, longitude):
        import random
        
        result = {
            'riskScore': random.uniform(0.1, 0.8),
            'riskLevel': 'MODERATE',
            'confidence': 0.7,
            'latitude': latitude,
            'longitude': longitude,
            'source': 'BasicFallback'
        }
        return json.dumps(result)
    
    if __name__ == '__main__':
        if len(sys.argv) == 3:
            try:
                latitude = float(sys.argv[1])
                longitude = float(sys.argv[2])
                result = basic_prediction(latitude, longitude)
                print(result)
            except:
                print(json.dumps({'error': 'Fallback prediction failed'}))
        else:
            print(json.dumps({'error': 'Invalid arguments'}))
