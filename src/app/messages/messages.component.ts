import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { Message } from '../models/Message';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  messages: Message[];

  tableColumns = ['subject', 'from', 'dateTime', 'delete'];
  dataSource;

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.getUserMessages();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  getUserMessages() {
    this.subscriptions.push(this.messageService.getAll().subscribe(response => {
      if (response.status === 200) {
        this.messages = response.payload;
        console.log(this.messages);
        console.log(response.payload);
        this.dataSource = this.messages;
      } else {
        alert('Sorry there was an error fetching your messages. Please try again later.');
        console.error(response);
      }
    }));
  }

  deleteMsg(id) {
    alert(id);
  }

}
