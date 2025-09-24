import { PermissionsAndroid, Platform } from 'react-native'
import Contacts from 'react-native-contacts'
import i18n from '@/lib/i18n/i18n'

interface ContactUtilsInterface {
  requestContactsPermission(): Promise<boolean>
  checkPermission(): Promise<boolean>
  getContacts(): Promise<Contact[]>
  formatContact(contact: any): Contact
}

export interface Contact {
  phone: string
  name?: string
  displayName?: string
}

class ContactUtils implements ContactUtilsInterface {
  
  async checkPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        )
        return granted
      } else {
        const permission = await Contacts.checkPermission()
        return permission === 'authorized'
      }
    } catch (error) {
      return false
    }
  }

  async requestContactsPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: i18n.t('permissions.contacts.title'),
            message: i18n.t('permissions.contacts.message'),
            buttonNeutral: i18n.t('permissions.contacts.askLater'),
            buttonNegative: i18n.t('permissions.contacts.cancel'),
            buttonPositive: i18n.t('permissions.contacts.allow'),
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const permission = await Contacts.checkPermission()
        if (permission === 'undefined') {
          const newPermission = await Contacts.requestPermission()
          return newPermission === 'authorized'
        }
        return permission === 'authorized'
      }
    } catch (error) {
      return false
    }
  }

  async getContacts(): Promise<Contact[]> {
    try {
      const hasPermission = await this.requestContactsPermission()
      if (!hasPermission) {
        throw new Error('Contacts permission denied')
      }

      const contacts = await Contacts.getAll()
      const formattedContacts: Contact[] = []
      
      for (const contact of contacts) {
        if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
          continue
        }
        
        for (const phoneNumber of contact.phoneNumbers) {
          if (!phoneNumber.number) continue
          
          const formattedContact = this.formatContact({
            phone: phoneNumber.number,
            name: contact.givenName || contact.familyName || contact.displayName,
            displayName: contact.displayName || `${contact.givenName || ''} ${contact.familyName || ''}`.trim()
          })
          
          if (this.isValidPhoneNumber(formattedContact.phone)) {
            formattedContacts.push(formattedContact)
          }
        }
      }
      
      const uniqueContacts = formattedContacts
        .filter((contact, index, self) => 
          index === self.findIndex(c => c.phone === contact.phone)
        )
        .slice(0, 1000)
      
      return uniqueContacts
    } catch (error) {
      throw error
    }
  }

  formatContact(contact: any): Contact {
    return {
      phone: this.cleanPhoneNumber(contact.phone),
      name: contact.name,
      displayName: contact.displayName || contact.name
    }
  }

  private cleanPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('0')) {
      cleaned = '+90' + cleaned.substring(1)
    }
    if (!cleaned.startsWith('+')) {
      cleaned = '+90' + cleaned
    }
    
    return cleaned
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phone)
  }

}
export const contactUtils = new ContactUtils()
export default contactUtils