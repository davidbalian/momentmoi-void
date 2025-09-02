import { createClientComponentClient } from './supabase'

export async function testVendorCreation() {
  const supabase = createClientComponentClient()
  
  try {

    
    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('Database connection test failed:', testError)
      return { success: false, error: testError }
    }
    

    
    // Test 2: Check vendor_profiles table structure
    const { data: vendorTableInfo, error: vendorTableError } = await supabase
      .from('vendor_profiles')
      .select('*')
      .limit(0)
    
    if (vendorTableError) {
      console.error('Vendor profiles table test failed:', vendorTableError)
      return { success: false, error: vendorTableError }
    }
    

    
    // Test 3: Check vendor_contacts table structure
    const { data: contactsTableInfo, error: contactsTableError } = await supabase
      .from('vendor_contacts')
      .select('*')
      .limit(0)
    
    if (contactsTableError) {
      console.error('Vendor contacts table test failed:', contactsTableError)
      return { success: false, error: contactsTableError }
    }
    

    
    // Test 4: Check vendor_locations table structure
    const { data: locationsTableInfo, error: locationsTableError } = await supabase
      .from('vendor_locations')
      .select('*')
      .limit(0)
    
    if (locationsTableError) {
      console.error('Vendor locations table test failed:', locationsTableError)
      return { success: false, error: locationsTableError }
    }
    

    
    return { success: true }
    
  } catch (error) {
    console.error('Test failed with exception:', error)
    return { success: false, error }
  }
}
