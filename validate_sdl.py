import yaml
import sys

def validate_akash_sdl(file_path):
    """Validate Akash SDL file structure"""
    try:
        with open(file_path, 'r') as f:
            sdl = yaml.safe_load(f)
        
        errors = []
        warnings = []
        
        # Check version
        if 'version' not in sdl:
            errors.append("Missing 'version' field")
        elif sdl['version'] != "2.0":
            errors.append(f"Invalid version: {sdl['version']}. Should be '2.0'")
        
        # Check services
        if 'services' not in sdl:
            errors.append("Missing 'services' section")
        else:
            for service_name, service_config in sdl['services'].items():
                if 'image' not in service_config:
                    errors.append(f"Service '{service_name}' missing 'image' field")
        
        # Check profiles
        if 'profiles' not in sdl:
            errors.append("Missing 'profiles' section")
        else:
            if 'compute' not in sdl['profiles']:
                errors.append("Missing 'profiles.compute' section")
            if 'placement' not in sdl['profiles']:
                errors.append("Missing 'profiles.placement' section")
        
        # Check deployment
        if 'deployment' not in sdl:
            errors.append("Missing 'deployment' section")
        
        # Print results
        if errors:
            print("❌ SDL Validation FAILED:")
            for error in errors:
                print(f"  - {error}")
        else:
            print("✅ SDL Validation PASSED!")
        
        if warnings:
            print("\n⚠️  Warnings:")
            for warning in warnings:
                print(f"  - {warning}")
        
        # Additional checks
        print(f"\n📊 SDL Summary:")
        print(f"  - Version: {sdl.get('version', 'Missing')}")
        print(f"  - Services: {list(sdl.get('services', {}).keys())}")
        print(f"  - Compute Profiles: {list(sdl.get('profiles', {}).get('compute', {}).keys())}")
        print(f"  - Placement Profiles: {list(sdl.get('profiles', {}).get('placement', {}).keys())}")
        
        return len(errors) == 0
        
    except yaml.YAMLError as e:
        print(f"❌ YAML Syntax Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

if __name__ == "__main__":
    file_path = "deploy-akash.yaml"
    is_valid = validate_akash_sdl(file_path)
    sys.exit(0 if is_valid else 1)
