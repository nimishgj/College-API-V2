#!/bin/bash

prompt_exit() {
  read -p "Press Enter to continue, or 'c' to exit..."
  if [[ "$REPLY" == "c" || "$REPLY" == "C" ]]; then
    echo "Exiting..."
    exit
  fi
}

while true; do
  echo "What would you like to do? (Enter the number)"

    echo "1. Create a Admin."
    echo "2. List all the Schemes."
    echo "3. Add a Scheme."
    echo "4. Add a Subject."
    echo "5. Delete a Scheme."
    echo "6. Delete a Subject."
    echo "7. List all the Users."
    echo "8. Delete a User."
    echo "9. Exit."

    read -p "Enter your choice: " choice

    case $choice in
      1)
        echo "Creating a Admin..."
        node "scripts/create-admin.js"
        prompt_exit
        ;;
      2)
        echo "Listing all the Schemes..."
        node "scripts/list-schemes.js"
        prompt_exit
        ;;
      3)
        echo "Adding a Scheme..."
        node "scripts/add-scheme.js"
        prompt_exit
        ;;
      4)
        echo "Adding a Subject..."
        node "scripts/add-subject.js"
        prompt_exit
        ;;
      5)
        echo "Deleting a Scheme..."
        node "scripts/delete-scheme.js"
        prompt_exit
        ;;
      6)
        echo "Deleting a Subject..."
        node "scripts/delete-subject.js"
        prompt_exit
        ;;
      7)
        echo "Listing all the Users..."
        node "scripts/list-users.js"
        prompt_exit
        ;;
      8)
        echo "Deleting a User..."
        node "scripts/delete-user.js"
        prompt_exit
        ;;
      9)
        echo "Exiting..."
        exit
        ;;
      *)
        echo "Invalid choice."
        ;;

    esac
done